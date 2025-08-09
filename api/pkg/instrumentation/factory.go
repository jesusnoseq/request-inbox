package instrumentation

import (
	"fmt"
	"log/slog"

	"github.com/jesusnoseq/request-inbox/pkg/config"
)

func NewEventTracker() (EventTracker, error) {
	if !config.GetBool(config.EnabledMonitoring) {
		slog.Info("Event tracking is disabled")
		return &NoOpEventTracker{}, nil
	}

	tracker, err := NewPostHogEventTracker()
	if err != nil {
		slog.Warn("Failed to initialize PostHog tracker, using NoOp",
			slog.String("error", err.Error()))
		return &NoOpEventTracker{}, fmt.Errorf("failed to initialize PostHog tracker: %w", err)
	}
	slog.Info("PostHog event tracker initialized")
	return tracker, nil
}
