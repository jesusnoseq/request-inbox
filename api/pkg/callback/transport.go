package callback

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
)

type callbackLookup func(context.Context, string) ([]net.IPAddr, error)
type callbackDial func(context.Context, string, string) (net.Conn, error)

// Resolve once, validate every answer, and dial the validated literal address.
// Keeping the original request URL preserves HTTP Host and TLS verification/SNI.
func dialCallback(ctx context.Context, network, address string, lookup callbackLookup, dial callbackDial) (net.Conn, error) {
	host, port, err := net.SplitHostPort(address)
	if err != nil {
		return nil, err
	}
	if err := validation.ValidateCallbackHost(host); err != nil {
		return nil, err
	}
	var addresses []net.IPAddr
	if ip := net.ParseIP(host); ip != nil {
		addresses = []net.IPAddr{{IP: ip}}
	} else {
		addresses, err = lookup(ctx, host)
		if err != nil {
			return nil, err
		}
	}
	if len(addresses) == 0 {
		return nil, fmt.Errorf("callback host has no IP addresses")
	}
	for _, address := range addresses {
		if address.Zone != "" {
			return nil, fmt.Errorf("scoped callback IP addresses are not supported")
		}
		if err := validation.ValidateCallbackIP(address.IP); err != nil {
			return nil, err
		}
	}
	for _, address := range addresses {
		conn, dialErr := dial(ctx, network, net.JoinHostPort(address.IP.String(), port))
		if dialErr == nil {
			return conn, nil
		}
		err = dialErr
	}
	return nil, err
}

func newCallbackClient(timeout time.Duration) (*http.Client, func()) {
	client := &http.Client{Timeout: timeout}
	cleanup := func() {}
	if config.GetBool(config.EnableCallbackURLValidation) {
		transport := http.DefaultTransport.(*http.Transport).Clone()
		// A proxy could resolve/connect to a destination outside this policy.
		transport.Proxy = nil
		dialer := &net.Dialer{Timeout: timeout, KeepAlive: 30 * time.Second}
		transport.DialContext = func(ctx context.Context, network, address string) (net.Conn, error) {
			return dialCallback(ctx, network, address, net.DefaultResolver.LookupIPAddr, dialer.DialContext)
		}
		client.Transport = transport
		cleanup = transport.CloseIdleConnections
	}
	client.CheckRedirect = func(req *http.Request, via []*http.Request) error {
		if !config.GetBool(config.EnableCallbackFollowRedirects) {
			return http.ErrUseLastResponse
		}
		if len(via) >= 10 {
			return fmt.Errorf("stopped after 10 callback redirects")
		}
		return validation.ValidateCallbackURL(req.URL.String())
	}
	return client, cleanup
}
