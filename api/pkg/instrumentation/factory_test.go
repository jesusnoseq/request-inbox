package instrumentation

import (
	"testing"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event"
)

func TestNewEventTracker_Disabled(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.EnabledMonitoring, false)

	tracker, err := NewEventTracker()

	if err != nil {
		t.Errorf("NewEventTracker() should not return error when disabled, got: %v", err)
	}
	if tracker == nil {
		t.Error("NewEventTracker() should return a tracker instance, got nil")
	}

	if _, ok := tracker.(*event.NoOpEventTracker); !ok {
		t.Errorf("NewEventTracker() should return *NoOpEventTracker when disabled, got: %T", tracker)
	}
}

func TestNewEventTracker_Enabled_MissingAPIKey(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.EnabledMonitoring, true)
	config.Set(config.PostHogAPIKey, "") // Missing API key
	config.Set(config.PostHogURL, "https://eu.i.posthog.com")

	tracker, err := NewEventTracker()

	if err == nil {
		t.Error("NewEventTracker() should return error when API key is missing")
	}

	if tracker == nil {
		t.Error("NewEventTracker() should return a tracker instance, got nil")
	}
	if _, ok := tracker.(*event.NoOpEventTracker); !ok {
		t.Errorf("NewEventTracker() should return *NoOpEventTracker as fallback, got: %T", tracker)
	}
}

func TestNewEventTracker_Enabled_MissingURL(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.EnabledMonitoring, true)
	config.Set(config.PostHogAPIKey, "test-api-key")
	config.Set(config.PostHogURL, "") // Missing URL

	tracker, err := NewEventTracker()

	if err == nil {
		t.Error("NewEventTracker() should return error when URL is missing")
	}

	if tracker == nil {
		t.Error("NewEventTracker() should return a tracker instance, got nil")
	}
	if _, ok := tracker.(*event.NoOpEventTracker); !ok {
		t.Errorf("NewEventTracker() should return *NoOpEventTracker as fallback, got: %T", tracker)
	}
}

func TestNewEventTracker_Enabled_ValidConfig(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.EnabledMonitoring, true)
	config.Set(config.PostHogAPIKey, "test-api-key")
	config.Set(config.PostHogURL, "https://eu.i.posthog.com")

	tracker, err := NewEventTracker()

	if err != nil {
		t.Errorf("NewEventTracker() should not return error with valid config, got: %v", err)
	}
	if tracker == nil {
		t.Error("NewEventTracker() should return a tracker instance, got nil")
	}

	if _, ok := tracker.(*PostHogEventTracker); !ok {
		t.Errorf("NewEventTracker() should return *PostHogEventTracker with valid config, got: %T", tracker)
	}

	if tracker != nil {
		_ = tracker.Close()
	}
}
