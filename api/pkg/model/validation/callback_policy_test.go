package validation

import (
	"net"
	"testing"

	"github.com/jesusnoseq/request-inbox/pkg/config"
)

func resetCallbackPolicy(t *testing.T) {
	t.Helper()
	config.LoadConfig(config.Test)
	for key, value := range map[config.Key]bool{
		config.EnableCallbackURLValidation: true,
		config.CallbackAllowPublicIPs:      true,
		config.CallbackAllowPrivateIPs:     false,
		config.CallbackAllowLoopbackIPs:    false,
		config.CallbackAllowLinkLocalIPs:   false,
	} {
		previous := config.GetBool(key)
		config.Set(key, value)
		t.Cleanup(func() { config.Set(key, previous) })
	}
	for _, key := range []config.Key{config.CallbackAllowedHosts, config.CallbackBlockedHosts} {
		previous := config.GetStringSlice(key)
		config.Set(key, "")
		t.Cleanup(func() { config.Set(key, previous) })
	}
}

func TestCallbackIPPolicy(t *testing.T) {
	resetCallbackPolicy(t)
	tests := []struct {
		ip   string
		flag config.Key
	}{
		{"8.8.8.8", config.CallbackAllowPublicIPs},
		{"2606:4700:4700::1111", config.CallbackAllowPublicIPs},
		{"10.0.0.1", config.CallbackAllowPrivateIPs},
		{"172.16.0.1", config.CallbackAllowPrivateIPs},
		{"192.168.1.1", config.CallbackAllowPrivateIPs},
		{"fd00::1", config.CallbackAllowPrivateIPs},
		{"127.0.0.2", config.CallbackAllowLoopbackIPs},
		{"::1", config.CallbackAllowLoopbackIPs},
		{"::ffff:127.0.0.1", config.CallbackAllowLoopbackIPs},
		{"::ffff:10.0.0.1", config.CallbackAllowPrivateIPs},
		{"169.254.169.254", config.CallbackAllowLinkLocalIPs},
		{"fe80::1", config.CallbackAllowLinkLocalIPs},
	}
	for _, tt := range tests {
		t.Run(tt.ip, func(t *testing.T) {
			previous := config.GetBool(tt.flag)
			defer config.Set(tt.flag, previous)
			for _, allowed := range []bool{false, true} {
				config.Set(tt.flag, allowed)
				if err := ValidateCallbackIP(net.ParseIP(tt.ip)); (err == nil) != allowed {
					t.Errorf("%s=%v: error = %v", tt.flag, allowed, err)
				}
			}
		})
	}
	for _, ip := range []string{
		"0.0.0.0", "0.1.2.3", "100.64.0.1", "192.0.0.1", "192.0.2.1",
		"198.18.0.1", "198.51.100.1", "203.0.113.1", "224.0.0.1", "240.0.0.1",
		"255.255.255.255", "::", "ff02::1", "2001:db8::1", "2002:7f00:1::",
		"64:ff9b::7f00:1", "3fff::1", "::ffff:169.254.169.254",
	} {
		if err := ValidateCallbackIP(net.ParseIP(ip)); err == nil {
			t.Errorf("expected non-public IP %s to be rejected", ip)
		}
	}
}

func TestCallbackHostLists(t *testing.T) {
	resetCallbackPolicy(t)
	// Environment values use whitespace-separated exact hosts, like CORS origins.
	t.Setenv(string(config.CallbackAllowedHosts), "Hooks.Example.com 8.8.8.8")
	// Remove the helper's explicit value so AutomaticEnv can read the setting.
	config.Set(config.CallbackAllowedHosts, nil)
	for _, host := range []string{"hooks.example.com", "HOOKS.EXAMPLE.COM.", "8.8.8.8", "::ffff:8.8.8.8"} {
		if err := ValidateCallbackHost(host); err != nil {
			t.Errorf("allowed host %s: %v", host, err)
		}
	}
	for _, host := range []string{"other.example.com", "sub.hooks.example.com", "hooks.example.com.attacker.test"} {
		if err := ValidateCallbackHost(host); err == nil {
			t.Errorf("unexpected allowed host %s", host)
		}
	}
	config.Set(config.CallbackBlockedHosts, "hooks.example.com")
	if err := ValidateCallbackURL("https://hooks.example.com/path"); err == nil {
		t.Fatal("blocked host must take precedence over allowed hosts")
	}
	config.Set(config.CallbackAllowedHosts, "10.0.0.1")
	if err := ValidateCallbackURL("http://10.0.0.1/path"); err == nil {
		t.Fatal("allowlisted host must not bypass IP policy")
	}
}

func TestFinalCallbackURLPolicy(t *testing.T) {
	resetCallbackPolicy(t)
	for _, rawURL := range []string{
		"http://user:password@example.com", "http://169.254.169.254/", "http://10.0.0.1/",
		"http://[fd00::1]/", "http://[::ffff:127.0.0.1]/", "http://localhost./",
		"https://api.request-inbox.com./", "https://example.com/{{.Request.Body}}",
		"http://[fe80::1%25eth0]/", "http:///path",
	} {
		if err := ValidateCallbackURL(rawURL); err == nil {
			t.Errorf("expected URL %s to be rejected", rawURL)
		}
	}
	config.Set(config.CallbackAllowLoopbackIPs, true)
	for _, rawURL := range []string{"http://127.0.0.1:8081/", "http://[::1]/", "http://localhost/"} {
		if err := ValidateCallbackURL(rawURL); err != nil {
			t.Errorf("loopback opt-in should allow %s: %v", rawURL, err)
		}
	}
	if err := ValidateCallbackURL("https://api.request-inbox.com/"); err == nil {
		t.Fatal("configured service hostname must remain blocked")
	}
	config.Set(config.EnableCallbackURLValidation, false)
	if err := ValidateCallbackURL("http://user:password@10.0.0.1/"); err != nil {
		t.Fatalf("legacy validation bypass failed: %v", err)
	}
}
