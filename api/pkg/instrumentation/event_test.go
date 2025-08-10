package instrumentation

import (
	"testing"
)

func TestAPIRequestEvent(t *testing.T) {
	event := APIRequestEvent{
		BaseEvent:  BaseEvent{UserID: "user123"},
		Method:     "GET",
		Endpoint:   "/api/v1/test",
		StatusCode: 200,
	}

	// Test GetEventType
	if event.GetEventType() != APIRequest {
		t.Errorf("Expected event type %v, got %v", APIRequest, event.GetEventType())
	}

	// Test GetUserID
	if event.GetUserID() != "user123" {
		t.Errorf("Expected user ID 'user123', got '%s'", event.GetUserID())
	}

	// Test ToProperties
	properties := event.ToProperties()
	expectedProperties := map[string]any{
		"method":       "GET",
		"$current_url": "/api/v1/test",
		"status_code":  200,
		"user_id":      "user123",
	}

	for key, expectedValue := range expectedProperties {
		if value, exists := properties[key]; !exists {
			t.Errorf("Expected property '%s' to exist", key)
		} else if value != expectedValue {
			t.Errorf("Expected property '%s' to be %v, got %v", key, expectedValue, value)
		}
	}
}

func TestUserLoginEvent(t *testing.T) {
	event := UserLoginEvent{
		BaseEvent: BaseEvent{UserID: "user456"},
		Provider:  "google",
		Success:   true,
	}

	// Test GetEventType
	if event.GetEventType() != UserLogin {
		t.Errorf("Expected event type %v, got %v", UserLogin, event.GetEventType())
	}

	// Test GetUserID
	if event.GetUserID() != "user456" {
		t.Errorf("Expected user ID 'user456', got '%s'", event.GetUserID())
	}

	// Test ToProperties
	properties := event.ToProperties()
	expectedProperties := map[string]any{
		"user_id":  "user456",
		"provider": "google",
		"success":  true,
	}

	for key, expectedValue := range expectedProperties {
		if value, exists := properties[key]; !exists {
			t.Errorf("Expected property '%s' to exist", key)
		} else if value != expectedValue {
			t.Errorf("Expected property '%s' to be %v, got %v", key, expectedValue, value)
		}
	}
}

func TestUserSignupEvent(t *testing.T) {
	event := UserSignupEvent{
		BaseEvent: BaseEvent{UserID: "user789"},
		Provider:  "github",
	}

	// Test GetEventType
	if event.GetEventType() != UserSignup {
		t.Errorf("Expected event type %v, got %v", UserSignup, event.GetEventType())
	}

	// Test GetUserID
	if event.GetUserID() != "user789" {
		t.Errorf("Expected user ID 'user789', got '%s'", event.GetUserID())
	}

	// Test ToProperties
	properties := event.ToProperties()
	expectedProperties := map[string]any{
		"user_id":  "user789",
		"provider": "github",
	}

	for key, expectedValue := range expectedProperties {
		if value, exists := properties[key]; !exists {
			t.Errorf("Expected property '%s' to exist", key)
		} else if value != expectedValue {
			t.Errorf("Expected property '%s' to be %v, got %v", key, expectedValue, value)
		}
	}
}

func TestUserSignupEventWithoutEmail(t *testing.T) {
	event := UserSignupEvent{
		BaseEvent: BaseEvent{UserID: "user000"},
		Provider:  "facebook",
	}

	// Test ToProperties with empty email
	properties := event.ToProperties()
	expectedProperties := map[string]any{
		"user_id":  "user000",
		"provider": "facebook",
	}

	for key, expectedValue := range expectedProperties {
		if value, exists := properties[key]; !exists {
			t.Errorf("Expected property '%s' to exist", key)
		} else if value != expectedValue {
			t.Errorf("Expected property '%s' to be %v, got %v", key, expectedValue, value)
		}
	}
}

func TestBaseEvent(t *testing.T) {
	baseEvent := BaseEvent{UserID: "testuser"}

	if baseEvent.GetUserID() != "testuser" {
		t.Errorf("Expected user ID 'testuser', got '%s'", baseEvent.GetUserID())
	}
}
