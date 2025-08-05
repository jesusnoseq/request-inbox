package embedded

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestListAllUsers(t *testing.T) {
	// Create temporary database
	tempDir := t.TempDir()
	db, err := NewInboxDB(tempDir, false)
	if err != nil {
		t.Fatal("Failed to create database:", err)
	}
	defer db.Close(context.Background())

	ctx := context.Background()

	// Create test users
	users := []model.User{
		{
			ID:        uuid.New(),
			Name:      "User 1",
			Email:     "user1@example.com",
			Role:      model.RoleUser,
			Timestamp: time.Now().Unix(),
		},
		{
			ID:        uuid.New(),
			Name:      "User 2",
			Email:     "user2@example.com",
			Role:      model.RoleUser,
			Timestamp: time.Now().Unix(),
		},
	}

	// Insert users
	for _, user := range users {
		err := db.UpsertUser(ctx, user)
		if err != nil {
			t.Fatal("Failed to insert user:", err)
		}
	}

	// Test ListAllUsers
	allUsers, err := db.ListAllUsers(ctx)
	if err != nil {
		t.Fatal("Failed to list all users:", err)
	}

	if len(allUsers) != len(users) {
		t.Errorf("Expected %d users, got %d", len(users), len(allUsers))
	}

	// Create a map for easy lookup
	userMap := make(map[uuid.UUID]model.User)
	for _, user := range allUsers {
		userMap[user.ID] = user
	}

	// Verify all inserted users are present
	for _, originalUser := range users {
		if foundUser, exists := userMap[originalUser.ID]; !exists {
			t.Errorf("User with ID %s not found", originalUser.ID.String())
		} else {
			if foundUser.Name != originalUser.Name {
				t.Errorf("Expected user name %s, got %s", originalUser.Name, foundUser.Name)
			}
			if foundUser.Email != originalUser.Email {
				t.Errorf("Expected user email %s, got %s", originalUser.Email, foundUser.Email)
			}
			if foundUser.Role != originalUser.Role {
				t.Errorf("Expected user role %s, got %s", originalUser.Role, foundUser.Role)
			}
		}
	}
}

func TestGetInboxesCreatedOverTime(t *testing.T) {
	// Create temporary database
	tempDir := t.TempDir()
	db, err := NewInboxDB(tempDir, false)
	if err != nil {
		t.Fatal("Failed to create database:", err)
	}
	defer db.Close(context.Background())

	ctx := context.Background()

	// Create test inboxes with different creation times
	baseTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)

	// Create inbox 1 for January
	inbox1, err := db.CreateInbox(ctx, model.Inbox{
		OwnerID: uuid.New(),
	})
	if err != nil {
		t.Fatal("Failed to create inbox:", err)
	}

	// Update timestamp for January
	inbox1.Timestamp = baseTime.UnixMilli()
	_, err = db.UpdateInbox(ctx, inbox1)
	if err != nil {
		t.Fatal("Failed to update inbox timestamp:", err)
	}

	// Create inbox 2 for February
	inbox2, err := db.CreateInbox(ctx, model.Inbox{
		OwnerID: uuid.New(),
	})
	if err != nil {
		t.Fatal("Failed to create inbox:", err)
	}

	// Update timestamp for February
	inbox2.Timestamp = baseTime.AddDate(0, 1, 0).UnixMilli()
	_, err = db.UpdateInbox(ctx, inbox2)
	if err != nil {
		t.Fatal("Failed to update inbox timestamp:", err)
	}

	// Create inbox 3 for January (same month as inbox 1)
	inbox3, err := db.CreateInbox(ctx, model.Inbox{
		OwnerID: uuid.New(),
	})
	if err != nil {
		t.Fatal("Failed to create inbox:", err)
	}

	// Update timestamp for January
	inbox3.Timestamp = baseTime.UnixMilli()
	_, err = db.UpdateInbox(ctx, inbox3)
	if err != nil {
		t.Fatal("Failed to update inbox timestamp:", err)
	}

	// Test GetInboxesCreatedOverTime
	chartData, err := db.GetInboxesCreatedOverTime(ctx)
	if err != nil {
		t.Fatal("Failed to get inboxes created over time:", err)
	}

	// Should have data for 2 months (January and February 2024)
	if len(chartData) < 2 {
		t.Errorf("Expected at least 2 data points, got %d", len(chartData))
	}

	// Create a map for easy lookup
	dataMap := make(map[string]int)
	for _, point := range chartData {
		dataMap[point.Date] = point.Count
	}

	// Check January count (should be 2)
	if count, exists := dataMap["2024-01"]; !exists {
		t.Error("Expected data for 2024-01")
	} else if count != 2 {
		t.Errorf("Expected 2 inboxes in January 2024, got %d", count)
	}

	// Check February count (should be 1)
	if count, exists := dataMap["2024-02"]; !exists {
		t.Error("Expected data for 2024-02")
	} else if count != 1 {
		t.Errorf("Expected 1 inbox in February 2024, got %d", count)
	}
}

func TestGetUserCreatedOverTime(t *testing.T) {
	// Create temporary database
	tempDir := t.TempDir()
	db, err := NewInboxDB(tempDir, false)
	if err != nil {
		t.Fatal("Failed to create database:", err)
	}
	defer db.Close(context.Background())

	ctx := context.Background()

	// Create test users with different registration times
	baseTime := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	users := []model.User{
		{
			ID:        uuid.New(),
			Name:      "User 1",
			Email:     "user1@example.com",
			Role:      model.RoleUser,
			Timestamp: baseTime.Unix(),
		},
		{
			ID:        uuid.New(),
			Name:      "User 2",
			Email:     "user2@example.com",
			Role:      model.RoleUser,
			Timestamp: baseTime.AddDate(0, 1, 0).Unix(), // February
		},
		{
			ID:        uuid.New(),
			Name:      "User 3",
			Email:     "user3@example.com",
			Role:      model.RoleAdmin,
			Timestamp: baseTime.Unix(), // Same month as User 1
		},
	}

	// Insert users
	for _, user := range users {
		err := db.UpsertUser(ctx, user)
		if err != nil {
			t.Fatal("Failed to insert user:", err)
		}
	}

	// Test GetUserRegistrationsOverTime
	chartData, err := db.GetUserCreatedOverTime(ctx)
	if err != nil {
		t.Fatal("Failed to get user registrations over time:", err)
	}

	// Should have data for 2 months (January and February 2024)
	if len(chartData) < 2 {
		t.Errorf("Expected at least 2 data points, got %d", len(chartData))
	}

	// Create a map for easy lookup
	dataMap := make(map[string]int)
	for _, point := range chartData {
		dataMap[point.Date] = point.Count
	}

	// Check January count (should be 2)
	if count, exists := dataMap["2024-01"]; !exists {
		t.Error("Expected data for 2024-01")
	} else if count != 2 {
		t.Errorf("Expected 2 users in January 2024, got %d", count)
	}

	// Check February count (should be 1)
	if count, exists := dataMap["2024-02"]; !exists {
		t.Error("Expected data for 2024-02")
	} else if count != 1 {
		t.Errorf("Expected 1 user in February 2024, got %d", count)
	}
}

func TestGetTotalRequestsCount(t *testing.T) {
	// Create temporary database
	tempDir := t.TempDir()
	db, err := NewInboxDB(tempDir, false)
	if err != nil {
		t.Fatal("Failed to create database:", err)
	}
	defer db.Close(context.Background())

	ctx := context.Background()

	// Create test inboxes with different numbers of requests
	inboxes := []model.Inbox{
		{
			ID:      uuid.New(),
			Name:    "Inbox 1",
			OwnerID: uuid.New(),
			Requests: []model.Request{
				{ID: 1, Timestamp: time.Now().Unix()},
				{ID: 2, Timestamp: time.Now().Unix()},
			},
		},
		{
			ID:      uuid.New(),
			Name:    "Inbox 2",
			OwnerID: uuid.New(),
			Requests: []model.Request{
				{ID: 3, Timestamp: time.Now().Unix()},
			},
		},
		{
			ID:       uuid.New(),
			Name:     "Inbox 3",
			OwnerID:  uuid.New(),
			Requests: []model.Request{}, // Empty
		},
	}

	// Insert inboxes
	for _, inbox := range inboxes {
		_, err := db.CreateInbox(ctx, inbox)
		if err != nil {
			t.Fatal("Failed to create inbox:", err)
		}
	}

	// Test GetTotalRequestsCount
	totalRequests, err := db.GetTotalRequestsCount(ctx)
	if err != nil {
		t.Fatal("Failed to get total requests count:", err)
	}

	// Expected total: 2 + 1 + 0 = 3
	expectedTotal := 3
	if totalRequests != expectedTotal {
		t.Errorf("Expected %d total requests, got %d", expectedTotal, totalRequests)
	}
}
