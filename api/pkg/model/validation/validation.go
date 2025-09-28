package validation

import (
	"fmt"
	"net"
	"net/url"
	"strings"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type ValidationError struct {
	message string
}

func (e *ValidationError) Error() string {
	return e.message
}

func IsValidInbox(inbox model.Inbox) (bool, error) {
	if inbox.ID == uuid.Nil {
		return false, &ValidationError{message: "Inbox ID cannot be empty"}
	}
	if inbox.Name == "" {
		return false, &ValidationError{message: "Inbox Name cannot be empty"}
	}
	if inbox.Timestamp == 0 {
		return false, &ValidationError{message: "Inbox Timestamp cannot be empty"}
	}
	if _, err := IsHTTPStatusCode(inbox.Response.Code); err != nil {
		return false, err
	}
	if len(inbox.Callbacks) > config.GetInt(config.MaxCallbacksKey) {
		return false, &ValidationError{message: fmt.Sprintf("Inbox cannot have more than %d callbacks", config.GetInt(config.MaxCallbacksKey))}
	}
	for _, cb := range inbox.Callbacks {
		if valid, err := IsValidCallback(cb); !valid {
			return false, err
		}
	}

	return true, nil
}

func IsValidCallback(cb model.Callback) (bool, error) {
	if !cb.IsEnabled {
		return true, nil
	}
	if _, err := IsValidCallbackURL(cb.ToURL); err != nil {
		return false, err
	}
	return true, nil
}

func IsHTTPStatusCode(code int) (bool, error) {
	if code < 100 || code > 999 {
		return false, &ValidationError{message: "Status code should be an integer between 100 and 999"}
	}
	return true, nil
}

func IsAPIKey(code string) (bool, error) {
	if len(code) != model.API_KEY_SIZE {
		return false, &ValidationError{message: fmt.Sprintf("API Key should be %d lenght", model.API_KEY_SIZE)}
	}
	return true, nil
}

func IsValidCallbackURL(urlStr string) (bool, error) {
	if !config.GetBool(config.EnableCallbackURLValidation) {
		return true, nil
	}

	if urlStr == "" {
		return false, &ValidationError{message: "Callback URL cannot be empty"}
	}

	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return false, &ValidationError{message: "Callback URL is not a valid URL"}
	}

	if parsedURL.Scheme == "" || parsedURL.Host == "" {
		return false, &ValidationError{message: "Callback URL is not a valid URL"}
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return false, &ValidationError{message: "Callback URL must use HTTP or HTTPS scheme"}
	}

	if isSelfURL(parsedURL.Host) {
		return false, &ValidationError{message: "Callback URL cannot point to the same service to prevent infinite loops"}
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
