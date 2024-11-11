package t_util

import (
	"testing"

	"github.com/google/uuid"
)

func AssertStatusCode(t *testing.T, expected, actual int) {
	t.Helper()

	if expected != actual {
		t.Errorf("Expected status code %d, but got %d", expected, actual)
	}
}

func AssertSameID(t *testing.T, expected, actual uuid.UUID) {
	t.Helper()
	if expected != actual {
		t.Fatalf("Expected ID %v but got %v", expected, actual)
	}
}
