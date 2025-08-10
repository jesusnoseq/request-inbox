package event

import (
	"context"
	"testing"
)

func TestNoOpEventTracker(t *testing.T) {
	tracker := &NoOpEventTracker{}
	ctx := context.Background()

	// Test that Track returns nil without error for various event types
	apiEvent := APIRequestEvent{
		BaseEvent:  BaseEvent{UserID: "test-user"},
		Method:     "GET",
		Endpoint:   "/api/test",
		StatusCode: 200,
	}
	err := tracker.Track(ctx, apiEvent)
	if err != nil {
		t.Errorf("Track for APIRequestEvent should not return error, got: %v", err)
	}

	loginEvent := UserLoginEvent{
		BaseEvent: BaseEvent{UserID: "test-user"},
		Provider:  "google",
		Success:   true,
	}
	err = tracker.Track(ctx, loginEvent)
	if err != nil {
		t.Errorf("Track for UserLoginEvent should not return error, got: %v", err)
	}

	signupEvent := UserSignupEvent{
		BaseEvent: BaseEvent{UserID: "test-user"},
		Provider:  "google",
	}
	err = tracker.Track(ctx, signupEvent)
	if err != nil {
		t.Errorf("Track for UserSignupEvent should not return error, got: %v", err)
	}

	err = tracker.Close()
	if err != nil {
		t.Errorf("Close should not return error, got: %v", err)
	}
}
