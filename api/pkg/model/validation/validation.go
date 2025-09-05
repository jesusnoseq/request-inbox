package validation

import (
	"fmt"
	"net"
	"net/url"
	"strings"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type ValidationError struct {
	message string
}

func (e *ValidationError) Error() string {
	return e.message
}

func IsHTTPStatusCode(code int) (bool, error) {
	if code < 100 || code > 999 {
		return false, &ValidationError{message: "Status code should be an intenger between 100 and 999"}
	}
	return true, nil
}

func IsAPIKey(code string) (bool, error) {
	if len(code) != model.API_KEY_SIZE {
		return false, &ValidationError{message: fmt.Sprintf("API Key should be %d lenght", model.API_KEY_SIZE)}
	}
	return true, nil
}

func IsValidPassThroughURL(urlStr string) (bool, error) {
	if urlStr == "" {
		return false, &ValidationError{message: "Pass-through URL cannot be empty"}
	}

	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return false, &ValidationError{message: "Pass-through URL is not a valid URL"}
	}

	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return false, &ValidationError{message: "Pass-through URL is not a valid URL"}
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return false, &ValidationError{message: "Pass-through URL must use HTTP or HTTPS scheme"}
	}

	if isSelfURL(parsedURL.Host) {
		return false, &ValidationError{message: "Pass-through URL cannot point to the same service to prevent infinite loops"}
	}

	return true, nil
}

func isSelfURL(host string) bool {
	hostWithoutPort := host

	if strings.HasPrefix(host, "[") && strings.Contains(host, "]:") {
		// IPv6 with port: [::1]:8080 or [0:0:0:0:0:0:0:1]:8080
		closeBracket := strings.Index(host, "]")
		if closeBracket > 0 {
			hostWithoutPort = host[1:closeBracket] // Remove brackets
		}
	} else if strings.HasPrefix(host, "[") && strings.HasSuffix(host, "]") {
		// IPv6 without port: [::1] or [0:0:0:0:0:0:0:1]
		hostWithoutPort = host[1 : len(host)-1]
	} else if strings.Count(host, ":") >= 2 && (strings.Contains(host, "::") || strings.Count(host, ":") >= 3) {
		// This looks like an IPv6 address without brackets (like ::1 or 0:0:0:0:0:0:0:1)
		// Don't try to remove port in this case
		hostWithoutPort = host
	} else if strings.Contains(host, ":") {
		// IPv4 with port: 127.0.0.1:8080
		lastColonIndex := strings.LastIndex(host, ":")
		if lastColonIndex > 0 {
			hostWithoutPort = host[:lastColonIndex]
		}
	}

	// Check for IPv6 localhost in expanded form before net.ParseIP
	if hostWithoutPort == "0:0:0:0:0:0:0:1" || hostWithoutPort == "0000:0000:0000:0000:0000:0000:0000:0001" {
		return true
	}

	// List of domain hosts that represent this service
	serviceDomains := []string{
		config.GetString(config.BackendApplicationDomain),
		"localhost",
	}

	// Check against known service domains
	for _, domain := range serviceDomains {
		if strings.EqualFold(hostWithoutPort, domain) {
			return true
		}
	}

	// Parse as IP address and check if it's a loopback
	if ip := net.ParseIP(hostWithoutPort); ip != nil {
		// this is less expensive than checking strings
		if ip.IsLoopback() {
			return true
		}
	}

	return false
}
