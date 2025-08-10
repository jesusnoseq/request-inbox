package instrumentation

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	gomock "github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event/event_tracker_mock"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestMonitoringMiddleware(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.EnabledMonitoring, false) // Use NoOp for testing

	et, err := NewEventTracker()
	if err != nil {
		t.Fatalf("Failed to initialize event tracker: %v", err)
	}

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(MonitoringMiddleware(et))

	r.GET("/test/:id", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "test"})
	})

	req, _ := http.NewRequest("GET", "/test/123", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestGetUserIDFromContext(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name     string
		setup    func(*gin.Context)
		expected string
	}{
		{
			name: "user_id in context",
			setup: func(c *gin.Context) {
				user := model.User{
					ID: uuid.New(),
				}
				c.Set("user", user)
			},
			expected: func() string {
				// Since UUID is random, we'll check it's not anonymous
				return "not_anonymous"
			}(),
		},
		{
			name:     "no user_id",
			setup:    func(c *gin.Context) {},
			expected: "anonymous",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c, _ := gin.CreateTestContext(httptest.NewRecorder())
			tt.setup(c)

			result := getUserIDFromContext(c)
			if tt.expected == "not_anonymous" {
				if result == "anonymous" {
					t.Errorf("Expected non-anonymous user ID, got %s", result)
				}
			} else if result != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestMonitoringMiddleware_HTTPMethodFilter(t *testing.T) {
	config.LoadConfig(config.Test)
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name              string
		method            string
		trackedMethods    string
		shouldCallTracker bool
	}{
		{
			name:              "POST method should be tracked (default config)",
			method:            "POST",
			trackedMethods:    "POST PUT PATCH DELETE",
			shouldCallTracker: true,
		},
		{
			name:              "PUT method should be tracked (default config)",
			method:            "PUT",
			trackedMethods:    "POST PUT PATCH DELETE",
			shouldCallTracker: true,
		},
		{
			name:              "PATCH method should be tracked (default config)",
			method:            "PATCH",
			trackedMethods:    "POST PUT PATCH DELETE",
			shouldCallTracker: true,
		},
		{
			name:              "DELETE method should be tracked (default config)",
			method:            "DELETE",
			trackedMethods:    "POST PUT PATCH DELETE",
			shouldCallTracker: true,
		},
		{
			name:              "GET method should not be tracked (default config)",
			method:            "GET",
			trackedMethods:    "POST PUT PATCH DELETE",
			shouldCallTracker: false,
		},
		{
			name:              "OPTIONS method should not be tracked (default config)",
			method:            "OPTIONS",
			trackedMethods:    "POST PUT PATCH DELETE",
			shouldCallTracker: false,
		},
		{
			name:              "HEAD method should not be tracked (default config)",
			method:            "HEAD",
			trackedMethods:    "POST PUT PATCH DELETE",
			shouldCallTracker: false,
		},
		{
			name:              "GET method should be tracked when configured",
			method:            "GET",
			trackedMethods:    "GET POST",
			shouldCallTracker: true,
		},
		{
			name:              "POST method should not be tracked when not in config",
			method:            "POST",
			trackedMethods:    "GET",
			shouldCallTracker: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockCtrl := gomock.NewController(t)
			defer mockCtrl.Finish()

			mockTracker := event_tracker_mock.NewMockEventTracker(mockCtrl)
			config.Set(config.MonitoringTrackedMethods, tt.trackedMethods)

			// Set up expectations
			if tt.shouldCallTracker {
				mockTracker.EXPECT().
					Track(gomock.Any(), gomock.Any()).
					Return(nil).
					Times(1)
			} else {
				mockTracker.EXPECT().
					Track(gomock.Any(), gomock.Any()).
					Times(0)
			}

			// Create gin router with middleware
			r := gin.New()
			r.Use(MonitoringMiddleware(mockTracker))

			// Add a route that accepts all methods
			r.Any("/test", func(c *gin.Context) {
				c.JSON(200, gin.H{"message": "test"})
			})

			// Create request with the test method
			req, _ := http.NewRequest(tt.method, "/test", nil)
			w := httptest.NewRecorder()

			// Perform request
			r.ServeHTTP(w, req)

			// Verify response
			if w.Code != 200 {
				t.Errorf("Expected status 200, got %d", w.Code)
			}

			// Give goroutine time to complete (since tracking is done in goroutine)
			time.Sleep(10 * time.Millisecond)
		})
	}
}
