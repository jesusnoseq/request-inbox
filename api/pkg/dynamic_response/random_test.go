package dynamic_response

import (
	"testing"

	"github.com/google/uuid"
)

func allCharsAreTheSame(s string) bool {
	if len(s) <= 1 {
		return true
	}
	firstChar := s[0]
	for i := 1; i < len(s); i++ {
		if s[i] != firstChar {
			return false
		}
	}
	return true
}

func TestRandomString(t *testing.T) {
	lengths := []int{10, 15, 20}
	for _, length := range lengths {
		random := randomString(length)
		if len(random) != length {
			t.Errorf("Random string length mismatch. Expected %d, got %d", length, len(random))
		}
		if allCharsAreTheSame(random) {
			t.Errorf("All characters in string %s are the same", random)
		}
	}
}

func TestRandomInt(t *testing.T) {
	tests := []struct {
		min, max int64
	}{
		{0, 10},
		{-100, 100},
		{1000, 2000},
	}

	for _, test := range tests {
		result := randomInt(test.min, test.max)
		if result < test.min || result > test.max {
			t.Errorf("Generated random integer %d not within range [%d, %d]", result, test.min, test.max)
		}
	}
}

func TestRandomFloat(t *testing.T) {
	tests := []struct {
		min, max float64
	}{
		{0, 10},
		{-100, 100},
		{1000, 2000},
	}

	for _, test := range tests {
		result := randomFloat(test.min, test.max)
		if result < test.min || result > test.max {
			t.Errorf("Generated random float %f not within range [%f, %f]", result, test.min, test.max)
		}
	}
}

func TestRandomBool(t *testing.T) {
	haveSomeTrues := false
	haveSomeFalses := false
	for i := 0; i < 50; i++ {
		result := randomBool()
		if result {
			haveSomeTrues = true
		} else {
			haveSomeFalses = true
		}

	}
	if !haveSomeTrues || !haveSomeFalses {
		t.Errorf("Generated bools are not random")
	}
}

func TestRandomUUID(t *testing.T) {
	uuidStr := randomUUID()
	_, err := uuid.Parse(uuidStr)

	if err != nil {
		t.Errorf("Generated id is not valid %v", err)
	}
}
