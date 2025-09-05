package validation

import (
	"testing"
)

func TestIsHTTPStatusCode(t *testing.T) {
	testCases := []struct {
		desc      string
		input     int
		isValid   bool
		expectErr bool
	}{
		{
			desc:    "Valid fist status code",
			input:   100,
			isValid: true,
		},
		{
			desc:    "Valid last status code",
			input:   999,
			isValid: true,
		},
		{
			desc:      "Not valid negative status code",
			input:     -200,
			isValid:   false,
			expectErr: true,
		},
		{
			desc:      "Not valid zero status code",
			input:     0,
			isValid:   false,
			expectErr: true,
		},
		{
			desc:      "Not valid out of limit status code",
			input:     1000,
			isValid:   false,
			expectErr: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			got, err := IsHTTPStatusCode(tc.input)
			if got != tc.isValid {
				t.Errorf("Expected %v, got %v", tc.isValid, got)
			}
			if tc.expectErr == (err == nil) {
				t.Errorf("Expected error, got %v", err)
			}
		})
	}
}

func TestIsValidPassThroughURL(t *testing.T) {
	tests := []struct {
		name        string
		url         string
		expectValid bool
		expectError string
	}{
		{
			name:        "empty URL",
			url:         "",
			expectValid: false,
			expectError: "Pass-through URL cannot be empty",
		},
		{
			name:        "invalid URL",
			url:         "not-a-url",
			expectValid: false,
			expectError: "Pass-through URL is not a valid URL",
		},
		{
			name:        "invalid scheme - ftp",
			url:         "ftp://example.com",
			expectValid: false,
			expectError: "Pass-through URL must use HTTP or HTTPS scheme",
		},
		{
			name:        "self URL - service domain",
			url:         "https://request-inbox.com/webhook",
			expectValid: false,
			expectError: "Pass-through URL cannot point to the same service to prevent infinite loops",
		},
		{
			name:        "self URL - localhost",
			url:         "http://localhost:8080/webhook",
			expectValid: false,
			expectError: "Pass-through URL cannot point to the same service to prevent infinite loops",
		},
		{
			name:        "self URL - loopback IP",
			url:         "http://127.0.0.1:8080/webhook",
			expectValid: false,
			expectError: "Pass-through URL cannot point to the same service to prevent infinite loops",
		},
		{
			name:        "valid external URL - HTTPS",
			url:         "https://example.com/webhook",
			expectValid: true,
		},
		{
			name:        "valid external URL - HTTP",
			url:         "http://example.com:3000/webhook",
			expectValid: true,
		},
		{
			name:        "valid external URL - subdomain",
			url:         "https://api.example.com/webhooks/endpoint",
			expectValid: true,
		},
		{
			name:        "valid external URL - with path and query",
			url:         "https://webhook.site/#!/12345678-1234-1234-1234-123456789012?param=value",
			expectValid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			valid, err := IsValidPassThroughURL(tt.url)

			if tt.expectValid {
				if !valid {
					t.Errorf("Expected URL %q to be valid, but got invalid", tt.url)
				}
				if err != nil {
					t.Errorf("Expected no error for valid URL %q, but got: %v", tt.url, err)
				}
			} else {
				if valid {
					t.Errorf("Expected URL %q to be invalid, but got valid", tt.url)
				}
				if err == nil {
					t.Errorf("Expected error for invalid URL %q, but got none", tt.url)
				} else if err.Error() != tt.expectError {
					t.Errorf("Expected error %q for URL %q, but got %q", tt.expectError, tt.url, err.Error())
				}
			}
		})
	}
}

func TestIsSelfURL(t *testing.T) {
	tests := []struct {
		name     string
		host     string
		expected bool
	}{
		// Service domains
		{
			name:     "request-inbox.com",
			host:     "request-inbox.com",
			expected: true,
		},
		{
			name:     "api.request-inbox.com",
			host:     "api.request-inbox.com",
			expected: true,
		},
		{
			name:     "case insensitive - uppercase",
			host:     "REQUEST-INBOX.COM",
			expected: true,
		},
		{
			name:     "case insensitive - mixed case",
			host:     "Api.Request-Inbox.Com",
			expected: true,
		},

		// Localhost
		{
			name:     "localhost",
			host:     "localhost",
			expected: true,
		},
		{
			name:     "localhost with port",
			host:     "localhost:8080",
			expected: true,
		},
		{
			name:     "localhost case insensitive",
			host:     "LOCALHOST",
			expected: true,
		},

		// IPv4 loopback addresses (127.0.0.0/8)
		{
			name:     "127.0.0.1",
			host:     "127.0.0.1",
			expected: true,
		},
		{
			name:     "127.0.0.1 with port",
			host:     "127.0.0.1:8080",
			expected: true,
		},
		{
			name:     "127.0.0.2",
			host:     "127.0.0.2",
			expected: true,
		},
		{
			name:     "127.1.0.1",
			host:     "127.1.0.1",
			expected: true,
		},
		{
			name:     "127.255.255.255",
			host:     "127.255.255.255",
			expected: true,
		},
		{
			name:     "127.0.0.255 with port",
			host:     "127.0.0.255:3000",
			expected: true,
		},

		// IPv6 loopback addresses
		{
			name:     "IPv6 localhost ::1",
			host:     "::1",
			expected: true,
		},
		{
			name:     "IPv6 localhost [::1]",
			host:     "[::1]",
			expected: true,
		},
		{
			name:     "IPv6 localhost with port [::1]:8080",
			host:     "[::1]:8080",
			expected: true,
		},
		{
			name:     "IPv6 localhost 0:0:0:0:0:0:0:1",
			host:     "0:0:0:0:0:0:0:1",
			expected: true,
		},
		{
			name:     "IPv6 localhost [0:0:0:0:0:0:0:1]",
			host:     "[0:0:0:0:0:0:0:1]",
			expected: true,
		},

		// Non-loopback addresses
		{
			name:     "external domain",
			host:     "example.com",
			expected: false,
		},
		{
			name:     "external subdomain",
			host:     "api.example.com",
			expected: false,
		},
		{
			name:     "similar but different domain",
			host:     "request-inbox.net",
			expected: false,
		},
		{
			name:     "subdomain of self domain",
			host:     "test.request-inbox.com",
			expected: false,
		},
		{
			name:     "external IPv4",
			host:     "192.168.1.1",
			expected: false,
		},
		{
			name:     "external IPv4 - 8.8.8.8",
			host:     "8.8.8.8",
			expected: false,
		},
		{
			name:     "external IPv4 - 10.0.0.1",
			host:     "10.0.0.1",
			expected: false,
		},
		{
			name:     "external IPv6",
			host:     "2001:db8::1",
			expected: false,
		},
		{
			name:     "non-loopback 126.x.x.x",
			host:     "126.255.255.255",
			expected: false,
		},
		{
			name:     "non-loopback 128.x.x.x",
			host:     "128.0.0.1",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isSelfURL(tt.host)
			if result != tt.expected {
				t.Errorf("isSelfURL(%q) = %v, expected %v", tt.host, result, tt.expected)
			}
		})
	}
}
