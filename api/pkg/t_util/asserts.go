package t_util

import (
	"reflect"
	"testing"
)

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

func AssertLen[T any](t *testing.T, items []T, expectedCount int) {
	t.Helper()
	actualCount := len(items)
	if actualCount != expectedCount {
		t.Fatalf("Expected %d items, but got %d", expectedCount, actualCount)
	}
}

func AssertNoError(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatalf("Expected no error, but got: %v", err)
	}
}
func AssertError(t *testing.T, err error) {
	t.Helper()
	if err == nil {
		t.Fatalf("Expected no error, but got: %v", err)
	}
}

func AssertStructIsEmpty(t *testing.T, s any) {
	t.Helper()

	v := reflect.ValueOf(s)
	if v.Kind() != reflect.Struct {
		t.Fatalf("Expected a struct, but got %T", s)
	}

	if !v.IsZero() {
		t.Fatalf("Expected struct to be empty, but it was not: %+v", s)
	}
}

func AssertStructIsNotEmpty(t *testing.T, s any) {
	t.Helper()

	v := reflect.ValueOf(s)
	if v.Kind() != reflect.Struct {
		t.Fatalf("Expected a struct, but got %T", s)
	}

	if v.IsZero() {
		t.Fatalf("Expected struct not to be empty, but it was: %+v", s)
	}
}
