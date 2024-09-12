package model

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewApiKey(t *testing.T) {
	userID := uuid.New()

	apiKey, err := NewApiKey(userID)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if apiKey.UserID != userID {
		t.Errorf("Expected UserID %v, got %v", userID, apiKey.UserID)
	}

	if apiKey.APIKey == "" {
		t.Error("Expected APIKey to be generated, but it is empty")
	}

	if len(apiKey.APIKey) != 32 {
		t.Errorf("Expected APIKey to have 32 chars, but it has %d", len(apiKey.APIKey))
	}

	expectedID := NewApiKeyID(apiKey.APIKey)
	if apiKey.ID != expectedID {
		t.Errorf("Expected ID %v, got %v", expectedID, apiKey.ID)
	}

	if apiKey.CreationDate.IsZero() {
		t.Error("Expected CreationDate to be set, but it is zero")
	}

	expectedExpiryDate := apiKey.CreationDate.AddDate(0, 3, 0)
	timeDiff := apiKey.ExpiryDate.Sub(expectedExpiryDate)
	if timeDiff > time.Second || timeDiff < -time.Second {
		t.Errorf("Expected ExpiryDate %v, got %v", expectedExpiryDate, apiKey.ExpiryDate)
	}

	if !apiKey.IsActive {
		t.Error("Expected IsActive to be true, but it is false")
	}

	if len(apiKey.Permissions) != 0 {
		t.Errorf("Expected Permissions to be empty, got %v", apiKey.Permissions)
	}
}

func TestNewApiKeyID(t *testing.T) {
	apiKey := "some-random-key"
	id1 := NewApiKeyID(apiKey)
	id2 := NewApiKeyID(apiKey)

	if id1 != id2 {
		t.Errorf("Expected the same UUID for the same API key, got %v and %v", id1, id2)
	}

	_, err := uuid.Parse(id1.String())
	if err != nil {
		t.Errorf("Expected a valid UUID, got error: %v", err)
	}
}
