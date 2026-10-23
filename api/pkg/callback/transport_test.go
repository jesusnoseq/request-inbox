package callback

import (
	"context"
	"errors"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func enableCallbackPolicy(t *testing.T) {
	t.Helper()
	for key, value := range map[config.Key]bool{
		config.EnableCallbackURLValidation:   true,
		config.EnableCallbackFollowRedirects: false,
		config.CallbackAllowPublicIPs:        true,
		config.CallbackAllowPrivateIPs:       false,
		config.CallbackAllowLoopbackIPs:      false,
		config.CallbackAllowLinkLocalIPs:     false,
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

func TestDialCallbackPinsDNSAnswers(t *testing.T) {
	enableCallbackPolicy(t)
	for _, tt := range []struct {
		name     string
		ips      []string
		wantDial bool
	}{
		{"public", []string{"8.8.8.8", "1.1.1.1"}, true},
		{"private", []string{"10.0.0.1"}, false},
		{"loopback", []string{"::1"}, false},
		{"metadata", []string{"169.254.169.254"}, false},
		{"mixed", []string{"8.8.8.8", "192.168.1.1"}, false},
		{"mapped", []string{"::ffff:127.0.0.1"}, false},
		{"no answers", nil, false},
	} {
		t.Run(tt.name, func(t *testing.T) {
			lookups, dials := 0, 0
			lookup := func(_ context.Context, host string) ([]net.IPAddr, error) {
				lookups++
				if host != "callback.example" {
					t.Errorf("unexpected lookup host %s", host)
				}
				var result []net.IPAddr
				for _, ip := range tt.ips {
					result = append(result, net.IPAddr{IP: net.ParseIP(ip)})
				}
				return result, nil
			}
			sentinel := errors.New("dial attempted")
			dial := func(_ context.Context, network, address string) (net.Conn, error) {
				if address != net.JoinHostPort(tt.ips[dials], "443") {
					t.Errorf("dial was not pinned: %s", address)
				}
				dials++
				return nil, sentinel
			}
			_, err := dialCallback(context.Background(), "tcp", "callback.example:443", lookup, dial)
			if lookups != 1 || (dials > 0) != tt.wantDial {
				t.Fatalf("lookups=%d dials=%d error=%v", lookups, dials, err)
			}
			if tt.wantDial && (!errors.Is(err, sentinel) || dials != len(tt.ips)) {
				t.Fatalf("expected fallback only to validated addresses: %v", err)
			}
		})
	}
}

func TestCallbackRedirectPolicy(t *testing.T) {
	enableCallbackPolicy(t)
	config.Set(config.CallbackAllowLoopbackIPs, true)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "http://169.254.169.254/metadata", http.StatusFound)
	}))
	defer server.Close()
	cb := model.Callback{ToURL: server.URL, Method: http.MethodGet}
	response := SendCallback(model.Inbox{}, 0, cb, model.Request{})
	if response.Code != http.StatusFound || response.Error != "" {
		t.Fatalf("redirect should be returned by default: %+v", response)
	}
	config.Set(config.EnableCallbackFollowRedirects, true)
	response = SendCallback(model.Inbox{}, 0, cb, model.Request{})
	if !strings.Contains(response.Error, "CALLBACK_ALLOW_LINK_LOCAL_IPS") {
		t.Fatalf("redirect target should be blocked: %+v", response)
	}
	client, cleanup := newCallbackClient(time.Second)
	defer cleanup()
	for _, target := range []string{"https://api.request-inbox.com/", "https://user:password@example.com/"} {
		req, err := http.NewRequest(http.MethodGet, target, nil)
		if err != nil {
			t.Fatal(err)
		}
		if err := client.CheckRedirect(req, nil); err == nil {
			t.Errorf("redirect %s should be rejected", target)
		}
	}
	config.Set(config.CallbackBlockedHosts, "blocked.example")
	req, _ := http.NewRequest(http.MethodGet, "https://blocked.example/", nil)
	if err := client.CheckRedirect(req, nil); err == nil {
		t.Fatal("redirect must respect host blocklist")
	}
	config.Set(config.CallbackBlockedHosts, "")
	req, _ = http.NewRequest(http.MethodGet, "https://example.com/", nil)
	if err := client.CheckRedirect(req, make([]*http.Request, 10)); err == nil {
		t.Fatal("redirect limit must be retained")
	}
}

func TestCallbackTransportPreservesTLSHostname(t *testing.T) {
	enableCallbackPolicy(t)
	server := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Host != r.TLS.ServerName {
			t.Errorf("Host %q differs from TLS SNI %q", r.Host, r.TLS.ServerName)
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()
	host := server.Certificate().DNSNames[0]
	client, cleanup := newCallbackClient(time.Second)
	defer cleanup()
	transport := client.Transport.(*http.Transport)
	if transport.Proxy != nil {
		t.Fatal("validated callbacks must not use environment proxies")
	}
	transport.TLSClientConfig = server.Client().Transport.(*http.Transport).TLSClientConfig.Clone()
	transport.DialContext = func(ctx context.Context, network, address string) (net.Conn, error) {
		return dialCallback(ctx, network, address,
			func(context.Context, string) ([]net.IPAddr, error) {
				return []net.IPAddr{{IP: net.ParseIP("8.8.8.8")}}, nil
			},
			func(ctx context.Context, network, address string) (net.Conn, error) {
				if address != "8.8.8.8:443" {
					t.Errorf("unexpected dial address %s", address)
				}
				return (&net.Dialer{}).DialContext(ctx, network, server.Listener.Addr().String())
			})
	}
	resp, err := client.Get("https://" + host + "/")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("unexpected status %d", resp.StatusCode)
	}
}

func TestSendCallbacksChecksExpandedURL(t *testing.T) {
	enableCallbackPolicy(t)
	inbox := model.Inbox{Callbacks: []model.Callback{{
		IsEnabled: true, IsDynamic: true, Method: http.MethodGet,
		ToURL: "http://{{.Request.Body}}example.com",
	}}}
	responses := SendCallbacks(context.Background(), inbox, model.Request{Body: "10.0.0.1/#"})
	if len(responses) != 1 || !strings.Contains(responses[0].Error, "CALLBACK_ALLOW_PRIVATE_IPS") {
		t.Fatalf("expanded private target should fail: %+v", responses)
	}
}
