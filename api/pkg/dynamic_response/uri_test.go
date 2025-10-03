package dynamic_response

import (
	"testing"
)

func TestExtractExtraURI(t *testing.T) {
	tests := []struct {
		name     string
		uri      string
		expected string
	}{
		{
			name:     "URI with path and query params",
			uri:      "/api/v1/inboxes/6e47f781-64cd-4e71-89d8-9a3754aa788c/in/extrapath?query=param",
			expected: "/extrapath?query=param",
		},
		{
			name:     "URI with only path",
			uri:      "/api/v1/inboxes/6e47f781-64cd-4e71-89d8-9a3754aa788c/in/extrapath",
			expected: "/extrapath",
		},
		{
			name:     "URI with only query params",
			uri:      "/api/v1/inboxes/6e47f781-64cd-4e71-89d8-9a3754aa788c/in?query=value",
			expected: "?query=value",
		},
		{
			name:     "URI with no extra path or query params",
			uri:      "/api/v1/inboxes/6e47f781-64cd-4e71-89d8-9a3754aa788c/in",
			expected: "",
		},
		{
			name:     "URI with multiple path segments",
			uri:      "/api/v1/inboxes/6e47f781-64cd-4e71-89d8-9a3754aa788c/in/path/to/resource?foo=bar&baz=qux",
			expected: "/path/to/resource?foo=bar&baz=qux",
		},
		{
			name:     "URI with multiple in path segments",
			uri:      "/api/v1/inboxes/6e47f781-64cd-4e71-89d8-9a3754aa788c/in/in/in/path",
			expected: "/in/in/path",
		},
		{
			name:     "Empty URI",
			uri:      "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := extractURI(tt.uri)
			if result != tt.expected {
				t.Errorf("extractURI(%q) = %q, want %q", tt.uri, result, tt.expected)
			}
		})
	}
}

func TestExtractExtraPath(t *testing.T) {
	tests := []struct {
		name     string
		uri      string
		expected string
	}{
		{
			name:     "URI with path and query params",
			uri:      "/api/v1/inboxes/6e47f781-64cd-4e71-89d8-9a3754aa788c/in/extrapath?asda=asda",
			expected: "/extrapath",
		},
		{
			name:     "URI with only path",
			uri:      "/api/v1/inboxes/123/in/extrapath",
			expected: "/extrapath",
		},
		{
			name:     "URI with only query params",
			uri:      "/api/v1/inboxes/123/in?query=value",
			expected: "",
		},
		{
			name:     "URI with empty extra path",
			uri:      "/api/v1/inboxes/123/in/",
			expected: "/",
		},
		{
			name:     "URI without /in/",
			uri:      "/api/v1/inboxes/123",
			expected: "",
		},
		{
			name:     "URI with multiple path segments",
			uri:      "/api/v1/inboxes/123/in/path/to/resource?foo=bar&baz=qux",
			expected: "/path/to/resource",
		},
		{
			name:     "Empty URI",
			uri:      "",
			expected: "",
		},
		{
			name:     "URI with path and fragment",
			uri:      "/api/v1/inboxes/123/in/extrapath?query=value#fragment",
			expected: "/extrapath",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := extractPath(tt.uri)
			if result != tt.expected {
				t.Errorf("extractExtraPath(%q) = %q, want %q", tt.uri, result, tt.expected)
			}
		})
	}
}

func TestExtractQueryParams(t *testing.T) {
	tests := []struct {
		name     string
		uri      string
		expected string
	}{
		{
			name:     "URI with query params",
			uri:      "/api/v1/inboxes/123/in/extrapath?asda=asda",
			expected: "?asda=asda",
		},
		{
			name:     "URI with multiple query params",
			uri:      "/api/v1/inboxes/123/in/extrapath?foo=bar&baz=qux",
			expected: "?foo=bar&baz=qux",
		},
		{
			name:     "URI without query params",
			uri:      "/api/v1/inboxes/123/in/extrapath",
			expected: "",
		},
		{
			name:     "URI with only query params",
			uri:      "?query=value",
			expected: "?query=value",
		},
		{
			name:     "URI with empty query params",
			uri:      "/api/v1/inboxes/123/in/extrapath?",
			expected: "?",
		},
		{
			name:     "URI with query params and fragment",
			uri:      "/api/v1/inboxes/123/in/extrapath?query=value#fragment",
			expected: "?query=value#fragment",
		},
		{
			name:     "Empty URI",
			uri:      "",
			expected: "",
		},
		{
			name:     "URI with encoded query params",
			uri:      "/api/v1/inboxes/123/in/extrapath?name=John%20Doe&email=test%40example.com",
			expected: "?name=John%20Doe&email=test%40example.com",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := extractQueryParams(tt.uri)
			if result != tt.expected {
				t.Errorf("extractQueryParams(%q) = %q, want %q", tt.uri, result, tt.expected)
			}
		})
	}
}
