package model

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewUser(t *testing.T) {
	email := "test@example.com"
	user := NewUser(email)

	if user.Email != email {
		t.Errorf("Expected email %s, got %s", email, user.Email)
	}
	expectedID := NewUserID(email)
	if user.ID != expectedID {
		t.Errorf("Expected ID %v, got %v", expectedID, user.ID)
	}
	if user.Timestamp == 0 {
		t.Error("Expected timestamp to be set, but it is 0")
	}
	now := time.Now().Unix()
	if user.Timestamp > now {
		t.Errorf("Expected timestamp to be <= %v, got %v", now, user.Timestamp)
	}
}

func TestNewUserID(t *testing.T) {
	email := "test@example.com"
	id1 := NewUserID(email)
	id2 := NewUserID(email)

	if id1 != id2 {
		t.Errorf("Expected the same UUID for the same email, got %v and %v", id1, id2)
	}

	_, err := uuid.Parse(id1.String())
	if err != nil {
		t.Errorf("Expected a valid UUID, got error: %v", err)
	}
}
