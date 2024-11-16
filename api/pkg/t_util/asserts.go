package t_util

import (
	"reflect"
	"testing"
)

func AssertStringNotEquals(t *testing.T, actual, expected string) {
	t.Helper()
	if actual == expected {
		t.Errorf("Expected: %q\nActual: %q", expected, actual)
	}
}

func AssertStringEquals(t *testing.T, actual, expected string) {
	t.Helper()
	if actual != expected {
		t.Errorf("Expected: %q\nActual: %q", expected, actual)
	}
}

func AssertTrue(t *testing.T, condition bool, message string) {
	t.Helper()

	if !condition {
		t.Errorf("Expected true but got false: %s", message)
	}
}

func AssertLen[T any](t *testing.T, items []T, expectedCount int) {
	t.Helper()
	actualCount := len(items)
	if actualCount != expectedCount {
		t.Errorf("Expected %d items, but got %d", expectedCount, actualCount)
	}
}

func AssertNoError(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Errorf("Expected no error, but got: %v", err)
	}
}
func AssertError(t *testing.T, err error) {
	t.Helper()
	if err == nil {
		t.Errorf("Expected no error, but got: %v", err)
	}
}

func AssertStructIsEmpty(t *testing.T, s any) {
	t.Helper()

	v := reflect.ValueOf(s)
	if v.Kind() != reflect.Struct {
		t.Errorf("Expected a struct, but got %T", s)
	}

	if !v.IsZero() {
		t.Errorf("Expected struct to be empty, but it was not: %+v", s)
	}
}

func AssertStructIsNotEmpty(t *testing.T, s any) {
	t.Helper()

	v := reflect.ValueOf(s)
	if v.Kind() != reflect.Struct {
		t.Errorf("Expected a struct, but got %T", s)
	}

	if v.IsZero() {
		t.Errorf("Expected struct not to be empty, but it was: %+v", s)
	}
}
