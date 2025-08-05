package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

// MockInboxDAO is a simple mock implementation for testing
type MockInboxDAO struct {
	users         []model.User
	inboxes       []model.Inbox
	chartData     []model.ChartPoint
	totalRequests int
	shouldError   bool
}

func (m *MockInboxDAO) ListAllUsers(ctx context.Context) ([]model.User, error) {
	if m.shouldError {
		return nil, errors.New("mock error")
	}
	return m.users, nil
}

func (m *MockInboxDAO) ListInbox(ctx context.Context) ([]model.Inbox, error) {
	if m.shouldError {
		return nil, errors.New("mock error")
	}
	return m.inboxes, nil
}

func (m *MockInboxDAO) GetInboxesCreatedOverTime(ctx context.Context) ([]model.ChartPoint, error) {
	if m.shouldError {
		return nil, errors.New("mock error")
	}
	return m.chartData, nil
}

func (m *MockInboxDAO) GetUserCreatedOverTime(ctx context.Context) ([]model.ChartPoint, error) {
	if m.shouldError {
		return nil, errors.New("mock error")
	}
	return m.chartData, nil
}

func (m *MockInboxDAO) GetTotalRequestsCount(ctx context.Context) (int, error) {
	if m.shouldError {
		return 0, errors.New("mock error")
	}
	return m.totalRequests, nil
}

// Implement remaining interface methods with no-ops for this test
func (m *MockInboxDAO) CreateInbox(ctx context.Context, inbox model.Inbox) (model.Inbox, error) {
	return inbox, nil
}
func (m *MockInboxDAO) UpdateInbox(ctx context.Context, inbox model.Inbox) (model.Inbox, error) {
	return inbox, nil
}
func (m *MockInboxDAO) GetInbox(ctx context.Context, id uuid.UUID) (model.Inbox, error) {
	return model.Inbox{}, nil
}
func (m *MockInboxDAO) GetInboxWithRequests(ctx context.Context, id uuid.UUID) (model.Inbox, error) {
	return model.Inbox{}, nil
}
func (m *MockInboxDAO) DeleteInbox(ctx context.Context, id uuid.UUID) error { return nil }
func (m *MockInboxDAO) ListInboxByUser(ctx context.Context, userID uuid.UUID) ([]model.Inbox, error) {
	return []model.Inbox{}, nil
}
func (m *MockInboxDAO) DeleteInboxRequests(ctx context.Context, id uuid.UUID) error { return nil }
func (m *MockInboxDAO) AddRequestToInbox(ctx context.Context, id uuid.UUID, req model.Request) error {
	return nil
}
func (m *MockInboxDAO) UpsertUser(ctx context.Context, user model.User) error { return nil }
func (m *MockInboxDAO) GetUser(ctx context.Context, id uuid.UUID) (model.User, error) {
	return model.User{}, nil
}
func (m *MockInboxDAO) DeleteUser(ctx context.Context, id uuid.UUID) error          { return nil }
func (m *MockInboxDAO) CreateAPIKey(ctx context.Context, apiKey model.APIKey) error { return nil }
func (m *MockInboxDAO) GetAPIKey(ctx context.Context, id uuid.UUID) (model.APIKey, error) {
	return model.APIKey{}, nil
}
func (m *MockInboxDAO) ListAPIKeyByUser(ctx context.Context, userID uuid.UUID) ([]model.APIKey, error) {
	return []model.APIKey{}, nil
}
func (m *MockInboxDAO) DeleteAPIKey(ctx context.Context, id uuid.UUID) error { return nil }
func (m *MockInboxDAO) Close(ctx context.Context) error                      { return nil }

func TestGetDashboardStats(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Create mock data
	user1ID := uuid.New()
	user2ID := uuid.New()

	mockDAO := &MockInboxDAO{
		users: []model.User{
			{ID: user1ID, Name: "User 1", Role: model.RoleUser},
			{ID: user2ID, Name: "Admin 1", Role: model.RoleAdmin},
		},
		inboxes: []model.Inbox{
			{
				ID:      uuid.New(),
				OwnerID: user1ID,
				Requests: []model.Request{
					{ID: 1, Timestamp: time.Now().Unix()},
				},
			},
			{
				ID:       uuid.New(),
				OwnerID:  user2ID,
				Requests: []model.Request{},
			},
		},
		totalRequests: 1,
	}

	adminHandler := NewAdminHandler(mockDAO)

	// Setup router
	router := gin.New()
	router.GET("/admin/stats", adminHandler.GetDashboardStats)

	// Create request
	req, err := http.NewRequest("GET", "/admin/stats", nil)
	if err != nil {
		t.Fatal(err)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert response
	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var stats model.AdminDashboardStats
	err = json.Unmarshal(w.Body.Bytes(), &stats)
	if err != nil {
		t.Fatal(err)
	}

	if stats.TotalUsers != 2 {
		t.Errorf("Expected TotalUsers to be 2, got %d", stats.TotalUsers)
	}
	if stats.TotalInboxes != 2 {
		t.Errorf("Expected TotalInboxes to be 2, got %d", stats.TotalInboxes)
	}
	if stats.TotalRequests != 1 {
		t.Errorf("Expected TotalRequests to be 1, got %d", stats.TotalRequests)
	}
	if stats.ActiveUsers != 1 {
		t.Errorf("Expected ActiveUsers to be 1, got %d", stats.ActiveUsers)
	}
}

func TestGetChartData(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockDAO := &MockInboxDAO{
		users: []model.User{
			{Role: model.RoleUser},
			{Role: model.RoleUser},
			{Role: model.RoleAdmin},
		},
		chartData: []model.ChartPoint{
			{Date: "2024-01", Count: 10},
			{Date: "2024-02", Count: 15},
		},
	}

	adminHandler := NewAdminHandler(mockDAO)

	// Setup router
	router := gin.New()
	router.GET("/admin/chart-data", adminHandler.GetChartData)

	// Create request
	req, err := http.NewRequest("GET", "/admin/chart-data", nil)
	if err != nil {
		t.Fatal(err)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert response
	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var chartData model.AdminChartData
	err = json.Unmarshal(w.Body.Bytes(), &chartData)
	if err != nil {
		t.Fatal(err)
	}

	if len(chartData.UserRegistrations) != 2 {
		t.Errorf("Expected 2 user registration points, got %d", len(chartData.UserRegistrations))
	}
	if len(chartData.InboxCreations) != 2 {
		t.Errorf("Expected 2 inbox creation points, got %d", len(chartData.InboxCreations))
	}
	if len(chartData.UserRoles) != 2 {
		t.Errorf("Expected 2 user roles, got %d", len(chartData.UserRoles))
	}
}

func TestGetAllUsers(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockDAO := &MockInboxDAO{
		users: []model.User{
			{ID: uuid.New(), Name: "User 1", Email: "user1@example.com", Role: model.RoleUser},
			{ID: uuid.New(), Name: "User 2", Email: "user2@example.com", Role: model.RoleUser},
			{ID: uuid.New(), Name: "Admin 1", Email: "admin1@example.com", Role: model.RoleAdmin},
		},
	}

	adminHandler := NewAdminHandler(mockDAO)

	// Setup router
	router := gin.New()
	router.GET("/admin/users", adminHandler.GetAllUsers)

	// Test pagination
	req, err := http.NewRequest("GET", "/admin/users?page=1&limit=2", nil)
	if err != nil {
		t.Fatal(err)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert response
	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	var response struct {
		Users []model.User `json:"users"`
		Total int          `json:"total"`
		Page  int          `json:"page"`
		Limit int          `json:"limit"`
	}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatal(err)
	}

	if response.Total != 3 {
		t.Errorf("Expected total to be 3, got %d", response.Total)
	}
	if response.Page != 1 {
		t.Errorf("Expected page to be 1, got %d", response.Page)
	}
	if response.Limit != 2 {
		t.Errorf("Expected limit to be 2, got %d", response.Limit)
	}
	if len(response.Users) != 2 {
		t.Errorf("Expected 2 users due to pagination, got %d", len(response.Users))
	}
}
