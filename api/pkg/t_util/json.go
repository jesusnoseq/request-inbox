package t_util

import (
	"encoding/json"
	"testing"
)

func MustJson(t *testing.T, payload any) []byte {
	t.Helper()
	b, err := json.Marshal(payload)
	if err != nil {
		panic(err)
	}
	return b
}

func AssertEqualsAsJson(t *testing.T, actual, expected any) {
	t.Helper()
	expectedJson := string(MustJson(t, expected))
	actualJson := string(MustJson(t, actual))

	if expectedJson != actualJson {
		t.Fatalf("Expected JSON %s but got %s", expectedJson, actualJson)
	}
}
