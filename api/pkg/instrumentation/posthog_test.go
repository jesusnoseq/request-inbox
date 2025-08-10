package instrumentation

import (
	"context"
	"testing"

	"github.com/jesusnoseq/request-inbox/pkg/config"
)

func TestNewPostHogEventTracker_MissingAPIKey(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.PostHogAPIKey, "")

	tracker, err := NewPostHogEventTracker()
	if err == nil {
		t.Error("Expected error when PostHog API key is missing")
	}
	if tracker != nil {
		t.Error("Expected nil tracker when API key is missing")
	}
}

func TestNewPostHogEventTracker_Success(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.PostHogAPIKey, "test_api_key")
	config.Set(config.PostHogURL, "https://test.posthog.com")

	tracker, err := NewPostHogEventTracker()
	if err != nil {
		t.Errorf("Expected no error, got: %v", err)
	}
	if tracker == nil {
		t.Error("Expected non-nil tracker")
	}
	err = tracker.Close()
	if err != nil {
		t.Fatalf("Failed to close PostHog tracker: %v", err)
	}
}

func TestPostHogEventTracker_Track(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.PostHogAPIKey, "test_api_key")
	config.Set(config.PostHogURL, "https://test.posthog.com")

	tracker, err := NewPostHogEventTracker()
	if err != nil {
		t.Skipf("Skipping PostHog tests due to initialization error: %v", err)
	}
	if tracker == nil {
		t.Skip("Skipping PostHog tests due to nil tracker")
	}

	ctx := context.Background()

	testEvent := APIRequestEvent{
		BaseEvent:  BaseEvent{UserID: "test_user"},
		Method:     "GET",
		Endpoint:   "/test",
		StatusCode: 200,
	}
	err = tracker.Track(ctx, testEvent)
	if err != nil {
		t.Errorf("Track should not return error, got: %v", err)
	}

	err = tracker.Close()
	if err != nil {
		t.Fatalf("Close should not return error, got: %v", err)
	}
}
