package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

func TestRegisterInboxRequest(t *testing.T) {
	config.LoadConfig(config.Test)

	tests := []struct {
		name           string
		inbox          model.Inbox
		requestBody    string
		requestMethod  string
		requestHeaders map[string]string
		requestURI     string
		wantStatus     int
		wantResponse   bool
	}{
		{
			name:          "register request to inbox with default response",
			inbox:         model.GenerateInbox(),
			requestBody:   `{"test": "data"}`,
			requestMethod: "POST",
			requestHeaders: map[string]string{
				"Content-Type": "application/json",
				"X-Custom":     "value",
			},
			requestURI:   "/test/path?param=value",
			wantStatus:   http.StatusOK,
			wantResponse: true,
		},
		{
			name: "register request to inbox with custom response",
			inbox: func() model.Inbox {
				inbox := model.GenerateInbox()
				inbox.Response.Code = http.StatusCreated
				inbox.Response.Body = `{"success": true}`
				inbox.Response.Headers = map[string]string{
					"Content-Type": "application/json",
					"X-Response":   "custom",
				}
				return inbox
			}(),
			requestBody:   `{"create": "resource"}`,
			requestMethod: "POST",
			requestHeaders: map[string]string{
				"Content-Type": "application/json",
			},
			requestURI:   "/create",
			wantStatus:   http.StatusCreated,
			wantResponse: true,
		},
		{
			name: "register request to inbox with 204 no content response",
			inbox: func() model.Inbox {
				inbox := model.GenerateInbox()
				inbox.Response.Code = http.StatusNoContent
				inbox.Response.Body = ""
				return inbox
			}(),
			requestBody:   `{"data": "test"}`,
			requestMethod: "PUT",
			requestHeaders: map[string]string{
				"Accept": "application/json",
			},
			requestURI:   "/no-content",
			wantStatus:   http.StatusNoContent,
			wantResponse: true,
		},
		{
			name:          "register GET request with no body",
			inbox:         model.GenerateInbox(),
			requestBody:   "",
			requestMethod: "GET",
			requestHeaders: map[string]string{
				"Accept": "text/html",
			},
			requestURI:   "/get-request",
			wantStatus:   http.StatusOK,
			wantResponse: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ih, closer := mustGetInboxHandler()
			defer closer()

			// Create inbox first
			createdInbox := shouldExistInbox(t, ih, tt.inbox)

			// Prepare request to register
			var body *bytes.Reader
			if tt.requestBody != "" {
				body = bytes.NewReader([]byte(tt.requestBody))
			} else {
				body = bytes.NewReader([]byte{})
			}

			w := httptest.NewRecorder()
			ginCtx, _ := gin.CreateTestContext(w)
			ginCtx.AddParam("id", createdInbox.ID.String())

			req, err := http.NewRequest(tt.requestMethod, tt.requestURI, body)
			if err != nil {
				t.Fatalf("Failed to create request: %v", err)
			}

			// Set headers
			for k, v := range tt.requestHeaders {
				req.Header.Set(k, v)
			}
			req.Host = "test.example.com"
			req.RemoteAddr = "192.168.1.1:12345"
			req.RequestURI = tt.requestURI

			ginCtx.Request = req

			// Call the method under test
			ih.RegisterInboxRequest(ginCtx)

			// Verify response
			resp := w.Result()
			defer mustCloseBody(t, resp)

			if tt.wantResponse && resp.StatusCode != tt.wantStatus {
				t.Errorf("Expected status %d, got %d, body: %s", tt.wantStatus, resp.StatusCode, w.Body.String())
			}

			// Verify request was added to inbox
			updatedInbox := getInbox(t, ih, createdInbox.ID)
			if len(updatedInbox.Requests) != len(createdInbox.Requests)+1 {
				t.Errorf("Expected %d requests, got %d", len(createdInbox.Requests)+1, len(updatedInbox.Requests))
			}

			if len(updatedInbox.Requests) > 0 {
				lastRequest := updatedInbox.Requests[len(updatedInbox.Requests)-1]

				// Verify request data
				if lastRequest.Method != tt.requestMethod {
					t.Errorf("Expected method %s, got %s", tt.requestMethod, lastRequest.Method)
				}

				if lastRequest.Body != tt.requestBody {
					t.Errorf("Expected body %s, got %s", tt.requestBody, lastRequest.Body)
				}

				if lastRequest.URI != tt.requestURI {
					t.Errorf("Expected URI %s, got %s", tt.requestURI, lastRequest.URI)
				}

				if lastRequest.Host != "test.example.com" {
					t.Errorf("Expected host test.example.com, got %s", lastRequest.Host)
				}

				if lastRequest.RemoteAddr != "192.168.1.1:12345" {
					t.Errorf("Expected remote addr 192.168.1.1:12345, got %s", lastRequest.RemoteAddr)
				}

				// Verify headers were captured
				for k, v := range tt.requestHeaders {
					if headerValues, exists := lastRequest.Headers[k]; !exists || len(headerValues) == 0 || headerValues[0] != v {
						t.Errorf("Expected header %s=%s, got %v", k, v, headerValues)
					}
				}

				// Verify timestamp is set
				if lastRequest.Timestamp <= 0 {
					t.Errorf("Expected timestamp > 0, got %d", lastRequest.Timestamp)
				}

				// Verify ID is incremented
				expectedID := len(createdInbox.Requests)
				if lastRequest.ID != expectedID {
					t.Errorf("Expected ID %d, got %d", expectedID, lastRequest.ID)
				}
			}
		})
	}
}

func TestRegisterInboxRequestInvalidID(t *testing.T) {
	config.LoadConfig(config.Test)
	ih, closer := mustGetInboxHandler()
	defer closer()

	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", "invalid-uuid")

	req, err := http.NewRequest("POST", "/test", bytes.NewReader([]byte(`{"test": "data"}`)))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.RequestURI = "/test"
	ginCtx.Request = req

	ih.RegisterInboxRequest(ginCtx)

	resp := w.Result()
	defer mustCloseBody(t, resp)

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected StatusBadRequest, got %d, body: %s", resp.StatusCode, w.Body.String())
	}
}

func TestRegisterInboxRequestNotFound(t *testing.T) {
	config.LoadConfig(config.Test)
	ih, closer := mustGetInboxHandler()
	defer closer()

	nonExistentID := uuid.New()
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", nonExistentID.String())

	req, err := http.NewRequest("POST", "/test", bytes.NewReader([]byte(`{"test": "data"}`)))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	req.RequestURI = "/test"
	ginCtx.Request = req

	ih.RegisterInboxRequest(ginCtx)

	resp := w.Result()
	defer mustCloseBody(t, resp)

	// The handler returns 500 for database errors, which includes "not found" cases
	// This is the current behavior of the system
	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected StatusInternalServerError, got %d, body: %s", resp.StatusCode, w.Body.String())
	}
}

func TestRegisterInboxRequestFiltersAuthCookies(t *testing.T) {
	config.LoadConfig(config.Test)
	ih, closer := mustGetInboxHandler()
	defer closer()

	inbox := model.GenerateInbox()
	createdInbox := shouldExistInbox(t, ih, inbox)

	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", createdInbox.ID.String())

	req, err := http.NewRequest("POST", "/test", bytes.NewReader([]byte(`{"test": "data"}`)))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	// Set cookies including auth tokens that should be filtered
	req.Header.Set("Cookie", "normal=value; "+login.AuthTokenCookieName+"=secret_token; "+login.OauthStateCookieName+"=oauth_state; another=cookie")
	req.RequestURI = "/test"
	ginCtx.Request = req

	ih.RegisterInboxRequest(ginCtx)

	// Verify request was added and auth cookies were filtered
	updatedInbox := getInbox(t, ih, createdInbox.ID)
	if len(updatedInbox.Requests) == 0 {
		t.Fatal("Expected at least one request")
	}

	lastRequest := updatedInbox.Requests[len(updatedInbox.Requests)-1]
	cookieHeaders := lastRequest.Headers["Cookie"]
	if len(cookieHeaders) == 0 {
		t.Fatal("Expected Cookie header to exist")
	}

	cookie := cookieHeaders[0]
	if contains(cookie, login.AuthTokenCookieName) {
		t.Errorf("Auth token cookie should be filtered out, got: %s", cookie)
	}
	if contains(cookie, login.OauthStateCookieName) {
		t.Errorf("OAuth state cookie should be filtered out, got: %s", cookie)
	}
	if !contains(cookie, "normal=value") {
		t.Errorf("Normal cookie should be preserved, got: %s", cookie)
	}
	if !contains(cookie, "another=cookie") {
		t.Errorf("Another cookie should be preserved, got: %s", cookie)
	}
}

// Helper functions

func mustCloseBody(t *testing.T, resp *http.Response) {
	if err := resp.Body.Close(); err != nil {
		t.Fatalf("Failed to close response body: %v", err)
	}
}

func mustGetInboxHandler() (*InboxHandler, func()) {
	ctx := context.Background()
	dao, err := database.GetInboxDAO(ctx, database.Badger)
	if err != nil {
		panic(err)
	}
	et, err := instrumentation.NewEventTracker()
	if err != nil {
		panic(err)
	}
	return NewInboxHandler(dao, et), func() {
		err := dao.Close(ctx)
		if err != nil {
			panic(err)
		}
	}
}

func mustParseInbox(payload []byte) model.Inbox {
	i := model.Inbox{}
	err := json.Unmarshal(payload, &i)
	if err != nil {
		panic(err)
	}
	return i
}

func shouldExistInbox(t *testing.T, ih *InboxHandler, i model.Inbox) model.Inbox {
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	body := t_util.MustJson(t, i)
	req, err := http.NewRequest("POST", "", bytes.NewReader(body))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	ginCtx.Request = req
	ih.CreateInbox(ginCtx)
	resp := w.Result()
	defer mustCloseBody(t, resp)
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("inbox should be created, got status %d, body: %s", resp.StatusCode, w.Body.String())
	}
	return mustParseInbox(w.Body.Bytes())
}

func getInbox(t *testing.T, ih *InboxHandler, id uuid.UUID) model.Inbox {
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", id.String())
	req, err := http.NewRequest("GET", "", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	ginCtx.Request = req
	ih.GetInbox(ginCtx)
	resp := w.Result()
	defer mustCloseBody(t, resp)
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected to get inbox, got status %d, body: %s", resp.StatusCode, w.Body.String())
	}
	return mustParseInbox(w.Body.Bytes())
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		s[:len(substr)] == substr ||
		s[len(s)-len(substr):] == substr ||
		containsAtIndex(s, substr))
}

func containsAtIndex(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
