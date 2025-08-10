package instrumentation

import (
	"fmt"
	"log/slog"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event"
)

func NewEventTracker() (event.EventTracker, error) {
	if !config.GetBool(config.EnabledMonitoring) {
		slog.Info("Event tracking is disabled")
		return &event.NoOpEventTracker{}, nil
	}

	tracker, err := NewPostHogEventTracker()
	if err != nil {
		slog.Warn("Failed to initialize PostHog tracker, using NoOp",
			slog.String("error", err.Error()))
		return &event.NoOpEventTracker{}, fmt.Errorf("failed to initialize PostHog tracker: %w", err)
	}
	slog.Info("PostHog event tracker initialized")
	return tracker, nil
}
