package instrumentation

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
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
