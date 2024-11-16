package t_util

import (
	"io"
	"net/http"
	"testing"

	"github.com/google/uuid"
)

func MustRequest(t *testing.T, method, url string, body io.Reader) *http.Request {
	t.Helper()
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		t.Fatalf("Couldn't create request %s %q (%s): %v\n", method, url, body, err)
	}
	return req
}

func AssertStatusCode(t *testing.T, expected, actual int) {
	t.Helper()

	if expected != actual {
		t.Errorf("Expected status code %d, but got %d", expected, actual)
	}
}

func AssertSameID(t *testing.T, expected, actual uuid.UUID) {
	t.Helper()
	if expected != actual {
		t.Errorf("Expected ID %v but got %v", expected, actual)
	}
}
