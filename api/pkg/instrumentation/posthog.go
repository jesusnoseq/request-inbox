package instrumentation

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/posthog/posthog-go"
)

type PostHogEventTracker struct {
	client posthog.Client
}

func NewPostHogEventTracker() (*PostHogEventTracker, error) {
	apiKey := config.GetString(config.PostHogAPIKey)
	if apiKey == "" {
		return nil, fmt.Errorf("PostHog API key is required")
	}

	url := config.GetString(config.PostHogURL)
	if url == "" {
		return nil, fmt.Errorf("PostHog URL is required")
	}

	client, err := posthog.NewWithConfig(apiKey, posthog.Config{
		Endpoint: url,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create PostHog client: %w", err)
	}

	return &PostHogEventTracker{
		client: client,
	}, nil
}

func (p *PostHogEventTracker) Track(ctx context.Context, event TrackedEvent) error {
	err := p.client.Enqueue(posthog.Capture{
		DistinctId: event.GetUserID(),
		Event:      string(event.GetEventType()),
		Properties: event.ToProperties(),
	})

	if err != nil {
		slog.ErrorContext(ctx, "Failed to track event",
			slog.String("event", string(event.GetEventType())),
			slog.String("user_id", event.GetUserID()),
			slog.String("error", err.Error()),
		)
		return fmt.Errorf("failed to track event: %w", err)
	}

	return nil
}

func (p *PostHogEventTracker) Close() error {
	err := p.client.Close()
	if err != nil {
		slog.Error("Failed to close PostHog client", "error", err)
	}
	return err
}
