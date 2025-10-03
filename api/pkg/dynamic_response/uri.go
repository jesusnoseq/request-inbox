package dynamic_response

import (
	"strings"
)

func extractURI(uri string) string {
	inOffset := 3 // +3 to skip "/in"
	idx := strings.Index(uri, "/in/")
	if idx != -1 {
		return uri[idx+inOffset:]
	}

	// Check if it ends with /in followed by query params or nothing
	idx = strings.Index(uri, "/in?")
	if idx != -1 {
		return uri[idx+inOffset:]
	}

	return ""
}

func extractPath(uri string) string {
	extraURI := extractURI(uri)
	if extraURI == "" {
		return ""
	}

	if idx := strings.Index(extraURI, "?"); idx != -1 {
		return extraURI[:idx]
	}
	return extraURI
}

func extractQueryParams(uri string) string {
	if idx := strings.Index(uri, "?"); idx != -1 {
		return uri[idx:]
	}
	return ""
}
