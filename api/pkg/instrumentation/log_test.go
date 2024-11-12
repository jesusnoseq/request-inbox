package instrumentation

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"strings"
	"testing"

	"github.com/jesusnoseq/request-inbox/pkg/collection"
)

func TestLogError(t *testing.T) {
	var buf bytes.Buffer
	logger := slog.New(slog.NewTextHandler(&buf, &slog.HandlerOptions{Level: slog.LevelDebug}))
	slog.SetDefault(logger)

	testCases := []struct {
		name           string
		err            error
		msg            string
		attrs          []slog.Attr
		expectedSubstr []string
	}{
		{
			name: "Basic error logging",
			err:  errors.New("test error"),
			msg:  "An error occurred",
			expectedSubstr: []string{
				"An error occurred",
				"test error",
				"caller=",
				"function=",
				"stackTrace=",
			},
		},
		{
			name: "Logging with additional attributes",
			err:  errors.New("another error"),
			msg:  "Error with context",
			attrs: []slog.Attr{
				slog.String("user", "john_doe"),
				slog.Int("attempt", 3),
			},
			expectedSubstr: []string{
				"Error with context",
				"another error",
				"caller=",
				"function=",
				"stackTrace=",
				"user=john_doe",
				"attempt=3",
			},
		},
		{
			name: "Logging without an error",
			err:  nil,
			msg:  "Warning: Resource not found",
			attrs: []slog.Attr{
				slog.String("resource_id", "12345"),
			},
			expectedSubstr: []string{
				"Warning: Resource not found",
				"caller=",
				"function=",
				"stackTrace=",
				"resource_id=12345",
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			buf.Reset()

			LogError(context.Background(), tc.err, tc.msg, collection.ToAnySlice(tc.attrs)...)

			logOutput := buf.String()

			for _, substr := range tc.expectedSubstr {
				if !strings.Contains(logOutput, substr) {
					t.Errorf("Expected log to contain '%s', but it didn't.\nLog output: %s", substr, logOutput)
				}
			}
			if tc.err != nil && !strings.Contains(logOutput, tc.err.Error()) {
				t.Errorf("Expected log to contain error message '%s', but it didn't.\nLog output: %s", tc.err.Error(), logOutput)
			}

			if !strings.Contains(logOutput, "level=ERROR") {
				t.Errorf("Expected log level to be ERROR, but it wasn't.\nLog output: %s", logOutput)
			}
		})
	}
}
