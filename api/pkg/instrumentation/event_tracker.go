package instrumentation

import (
	"context"
)

//go:generate mockgen -source=event_tracker.go -destination=event_tracker_mock/event_tracker_mock.go -package=instrumentation_mock EventTracker

type EventTracker interface {
	Track(ctx context.Context, event TrackedEvent) error
	Close() error
}

// NoOpEventTracker is a no-operation implementation when tracking is disabled
type NoOpEventTracker struct{}

func (n *NoOpEventTracker) Track(ctx context.Context, event TrackedEvent) error {
	return nil
}

func (n *NoOpEventTracker) Close() error {
	return nil
}
