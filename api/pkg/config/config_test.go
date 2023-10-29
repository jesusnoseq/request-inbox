package config

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestConfig(t *testing.T) {
	t.Run("String default get and set config", func(t *testing.T) {
		testKey := Key("STR_TEST_KEY")
		defaultTestValue := "DEFAULT_TEST_VALUE"
		testValue := "TEST_VALUE"

		setDefault(testKey, defaultTestValue)
		got := GetString(testKey)
		if got != defaultTestValue {
			t.Errorf("GetString(%v) = %v, want %v", testKey, got, defaultTestValue)
		}

		Set(testKey, testValue)
		got = GetString(testKey)
		if got != testValue {
			t.Errorf("GetString(%v) = %v, want %v", testKey, got, testValue)
		}
	})

	t.Run("Bool default get and set config", func(t *testing.T) {
		testKey := Key("BOOL_TEST_KEY")
		defaultTestValue := "true"
		testValue := "false"

		setDefault(testKey, defaultTestValue)
		got := GetBool(testKey)
		if got != true {
			t.Errorf("GetBool(%v) = %v, want %v", testKey, got, defaultTestValue)
		}

		Set(testKey, testValue)
		got = GetBool(testKey)
		if got != false {
			t.Errorf("GetBool(%v) = %v, want %v", testKey, got, testValue)
		}
	})

	t.Run("Int as string default get and set config", func(t *testing.T) {
		testKey := Key("INT_TEST_KEY")
		defaultTestValue := "1"
		testValue := "2"

		setDefault(testKey, defaultTestValue)
		got := GetInt(testKey)
		if got != 1 {
			t.Errorf("GetInt(%v) = %v, want %v", testKey, got, defaultTestValue)
		}

		Set(testKey, testValue)
		got = GetInt(testKey)
		if got != 2 {
			t.Errorf("GetInt(%v) = %v, want %v", testKey, got, testValue)
		}
	})

	t.Run("Int as int default get and set config", func(t *testing.T) {
		testKey := Key("INT_INT_TEST_KEY")
		defaultTestValue := 1
		testValue := 2

		setDefault(testKey, defaultTestValue)
		got := GetInt(testKey)
		if got != 1 {
			t.Errorf("GetInt(%v) = %v, want %v", testKey, got, defaultTestValue)
		}

		Set(testKey, testValue)
		got = GetInt(testKey)
		if got != 2 {
			t.Errorf("GetInt(%v) = %v, want %v", testKey, got, testValue)
		}
	})

	t.Run("String slice default get and set config", func(t *testing.T) {
		testKey := Key("STR_SLC_TEST_KEY")
		defaultTestValue := "a b.c d-e"
		testValue := "one two three"
		setDefault(testKey, defaultTestValue)
		got := GetStringSlice(testKey)
		want := []string{"a", "b.c", "d-e"}

		if !cmp.Equal(got, want) {
			t.Errorf("GetStringSlice(%v) = %v, want %v. Diff: %v", testKey, got, want, cmp.Diff(got, want))
		}

		Set(testKey, testValue)
		got = GetStringSlice(testKey)
		want = []string{"one", "two", "three"}
		if !cmp.Equal(got, want) {
			t.Errorf("GetStringSlice(%v) = %v, want %v. Diff: %v", testKey, got, want, cmp.Diff(got, want))
		}

	})

	t.Run("Load config and check some default", func(t *testing.T) {
		LoadConfig(Test)
		got := GetString(APIHTTPPort)
		if got != APIHTTPPortDefault {
			t.Errorf("GetString(%v) = %v, want %v", APIHTTPPort, got, APIHTTPPortDefault)
		}
	})
}
