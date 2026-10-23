package validation

import (
	"fmt"
	"net"
	"net/netip"
	"strings"

	"github.com/jesusnoseq/request-inbox/pkg/config"
)

// Special-use ranges that are not public callback destinations. IPv6 public
// addresses must also be in 2000::/3, excluding translation/local-use ranges.
var callbackReservedPrefixes = []netip.Prefix{
	netip.MustParsePrefix("0.0.0.0/8"),
	netip.MustParsePrefix("100.64.0.0/10"),
	netip.MustParsePrefix("192.0.0.0/24"),
	netip.MustParsePrefix("192.0.2.0/24"),
	netip.MustParsePrefix("192.88.99.0/24"),
	netip.MustParsePrefix("198.18.0.0/15"),
	netip.MustParsePrefix("198.51.100.0/24"),
	netip.MustParsePrefix("203.0.113.0/24"),
	netip.MustParsePrefix("240.0.0.0/4"),
	netip.MustParsePrefix("2001::/23"),
	netip.MustParsePrefix("2001:db8::/32"),
	netip.MustParsePrefix("2002::/16"),
	netip.MustParsePrefix("3fff::/20"),
}

var callbackPublicIPv6Prefix = netip.MustParsePrefix("2000::/3")

func normalizeCallbackHost(host string) string {
	host = strings.TrimSuffix(strings.ToLower(strings.TrimSpace(host)), ".")
	host = strings.TrimPrefix(strings.TrimSuffix(host, "]"), "[")
	if ip, err := netip.ParseAddr(host); err == nil {
		return ip.Unmap().String()
	}
	return host
}

// ValidateCallbackHost applies exact hostname/IP lists; blocking wins over allowing.
// Host allowlisting never overrides the IP policy.
func ValidateCallbackHost(host string) error {
	host = normalizeCallbackHost(host)
	for _, blocked := range config.GetStringSlice(config.CallbackBlockedHosts) {
		if host == normalizeCallbackHost(blocked) {
			return fmt.Errorf("callback host %q is blocked", host)
		}
	}
	allowed := config.GetStringSlice(config.CallbackAllowedHosts)
	if len(allowed) == 0 {
		return nil
	}
	for _, entry := range allowed {
		if host == normalizeCallbackHost(entry) {
			return nil
		}
	}
	return fmt.Errorf("callback host %q is not allowed", host)
}

func ValidateCallbackIP(ip net.IP) error {
	addr, ok := netip.AddrFromSlice(ip)
	if !ok {
		return fmt.Errorf("invalid callback IP address")
	}
	addr = addr.Unmap()
	var key config.Key
	switch {
	case addr.IsLoopback():
		key = config.CallbackAllowLoopbackIPs
	case addr.IsPrivate():
		key = config.CallbackAllowPrivateIPs
	case addr.IsLinkLocalUnicast():
		key = config.CallbackAllowLinkLocalIPs
	default:
		if !addr.IsGlobalUnicast() || (addr.Is6() && !callbackPublicIPv6Prefix.Contains(addr)) {
			return fmt.Errorf("callback IP %s is not a supported unicast destination", addr)
		}
		for _, prefix := range callbackReservedPrefixes {
			if prefix.Contains(addr) {
				return fmt.Errorf("callback IP %s is in a reserved range", addr)
			}
		}
		key = config.CallbackAllowPublicIPs
	}
	if !config.GetBool(key) {
		return fmt.Errorf("callback IP %s is disabled by %s", addr, key)
	}
	return nil
}
