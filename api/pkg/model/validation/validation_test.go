package validation

import (
	"testing"
)

func TestIsHTTPStatusCode(t *testing.T) {
	testCases := []struct {
		desc      string
		input     int
		isValid   bool
		expectErr bool
	}{
		{
			desc:    "Valid fist status code",
			input:   100,
			isValid: true,
		},
		{
			desc:    "Valid last status code",
			input:   999,
			isValid: true,
		},
		{
			desc:      "Not valid negative status code",
			input:     -200,
			isValid:   false,
			expectErr: true,
		},
		{
			desc:      "Not valid zero status code",
			input:     0,
			isValid:   false,
			expectErr: true,
		},
		{
			desc:      "Not valid out of limit status code",
			input:     1000,
			isValid:   false,
			expectErr: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			got, err := IsHTTPStatusCode(tc.input)
			if got != tc.isValid {
				t.Errorf("Expected %v, got %v", tc.isValid, got)
			}
			if tc.expectErr == (err == nil) {
				t.Errorf("Expected error, got %v", err)
			}
		})
	}
}
