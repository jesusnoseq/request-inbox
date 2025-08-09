package instrumentation

import (
	"context"
)

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
