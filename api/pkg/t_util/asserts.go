package t_util

import "testing"

func AssertStringEquals(t *testing.T, actual, expected string) {
	t.Helper()
	if actual != expected {
		t.Fatalf("Expected: %q\nActual: %q", expected, actual)
	}
}

func AssertTrue(t *testing.T, condition bool, message string) {
	t.Helper()

	if !condition {
		t.Fatalf("Expected true but got false: %s", message)
	}
}
