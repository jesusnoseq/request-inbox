package callback

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

func init() {
	// Initialize test config
	config.LoadConfig(config.Test)
}

// Helper function to create test request
func createTestRequest() model.Request {
	return model.Request{
		ID:        1,
		Timestamp: time.Now().Unix(),
		URI:       "/test",
		Host:      "localhost",
		Method:    "POST",
		Headers:   map[string][]string{"Content-Type": {"application/json"}},
		Body:      `{"incoming": "request"}`,
	}
}

func TestSendCallback_Success(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify request method
		if r.Method != "POST" {
			t.Errorf("Expected POST method, got %s", r.Method)
		}

		// Verify headers
		if r.Header.Get("Content-Type") != "application/json" {
			t.Errorf("Expected Content-Type application/json, got %s", r.Header.Get("Content-Type"))
		}

		// Verify custom header
		if r.Header.Get("X-Test-Header") != "test-value" {
			t.Errorf("Expected X-Test-Header test-value, got %s", r.Header.Get("X-Test-Header"))
		}

		// Set response headers and body
		w.Header().Set("X-Response-Header", "response-value")
		w.WriteHeader(http.StatusOK)
		t_util.MustWrite(t, w, []byte(`{"success": true}`))
	}))
	defer server.Close()

	inbox := model.Inbox{ID: uuid.New()}
	callback := model.Callback{
		IsEnabled: true,
		ToURL:     server.URL,
		Method:    "POST",
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"X-Test-Header": "test-value",
		},
		Body: `{"test": "data"}`,
	}
	request := createTestRequest()

	response := SendCallback(inbox, 0, callback, request)

	if response.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, response.Code)
	}

	if response.URL != server.URL {
		t.Errorf("Expected URL %s, got %s", server.URL, response.URL)
	}

	if response.Method != "POST" {
		t.Errorf("Expected Method POST, got %s", response.Method)
	}

	if response.Error != "" {
		t.Errorf("Expected no error, got %s", response.Error)
	}

	if response.Body != `{"success": true}` {
		t.Errorf("Expected body %s, got %s", `{"success": true}`, response.Body)
	}

	if response.Headers["X-Response-Header"] != "response-value" {
		t.Errorf("Expected X-Response-Header response-value, got %s", response.Headers["X-Response-Header"])
	}
}

func TestSendCallback_HTTPError(t *testing.T) {
	// Create test server that returns error
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		t_util.MustWrite(t, w, []byte(`{"error": "internal server error"}`))
	}))
	defer server.Close()

	inbox := model.Inbox{ID: uuid.New()}
	callback := model.Callback{
		IsEnabled: true,
		ToURL:     server.URL,
		Method:    "POST",
		Headers:   map[string]string{"Content-Type": "application/json"},
		Body:      `{"test": "data"}`,
	}
	request := createTestRequest()

	response := SendCallback(inbox, 0, callback, request)

	if response.Code != http.StatusInternalServerError {
		t.Errorf("Expected status code %d, got %d", http.StatusInternalServerError, response.Code)
	}

	if response.Body != `{"error": "internal server error"}` {
		t.Errorf("Expected body %s, got %s", `{"error": "internal server error"}`, response.Body)
	}
}

func TestSendCallback_InvalidURL(t *testing.T) {
	inbox := model.Inbox{ID: uuid.New()}
	callback := model.Callback{
		IsEnabled: true,
		ToURL:     "invalid-url",
		Method:    "POST",
		Headers:   map[string]string{},
		Body:      "",
	}
	request := createTestRequest()

	response := SendCallback(inbox, 0, callback, request)

	if response.Code != 0 {
		t.Errorf("Expected status code 0, got %d", response.Code)
	}

	if response.Error == "" {
		t.Error("Expected error message in response Error field, got empty string")
	}

	if !strings.Contains(response.Error, "Error") {
		t.Errorf("Expected error message about creating or sending request, got %s", response.Error)
	}
}

func TestSendCallback_NetworkError(t *testing.T) {
	inbox := model.Inbox{ID: uuid.New()}
	callback := model.Callback{
		IsEnabled: true,
		ToURL:     "http://non-existent-host-12345.com",
		Method:    "POST",
		Headers:   map[string]string{},
		Body:      "",
	}
	request := createTestRequest()

	response := SendCallback(inbox, 0, callback, request)

	if response.Code != 0 {
		t.Errorf("Expected status code 0, got %d", response.Code)
	}

	if !strings.Contains(response.Error, "Error sending callback request") {
		t.Errorf("Expected error message about sending request, got %s", response.Error)
	}
}

func TestSendCallback_GETMethod(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			t.Errorf("Expected GET method, got %s", r.Method)
		}

		w.WriteHeader(http.StatusOK)
		t_util.MustWrite(t, w, []byte(`{"method": "GET"}`))
	}))
	defer server.Close()

	inbox := model.Inbox{ID: uuid.New()}
	callback := model.Callback{
		IsEnabled: true,
		ToURL:     server.URL,
		Method:    "GET",
		Headers:   map[string]string{},
		Body:      "",
	}
	request := createTestRequest()

	response := SendCallback(inbox, 0, callback, request)

	if response.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, response.Code)
	}
	if response.Body != `{"method": "GET"}` {
		t.Errorf("Expected body %s, got %s", `{"method": "GET"}`, response.Body)
	}
}

func TestSendCallback_EmptyBody(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if r.Header.Get("Content-Type") != "" {
			t.Errorf("Expected no Content-Type header for empty body, got %s", r.Header.Get("Content-Type"))
		}

		w.WriteHeader(http.StatusOK)
		t_util.MustWrite(t, w, []byte(`{"received": "empty"}`))
	}))
	defer server.Close()

	inbox := model.Inbox{ID: uuid.New()}
	callback := model.Callback{
		IsEnabled: true,
		ToURL:     server.URL,
		Method:    "POST",
		Headers:   map[string]string{},
		Body:      "",
	}
	request := createTestRequest()

	response := SendCallback(inbox, 0, callback, request)

	if response.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, response.Code)
	}
}

func TestSendCallback_WithCustomContentType(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Content-Type") != "text/plain" {
			t.Errorf("Expected Content-Type text/plain, got %s", r.Header.Get("Content-Type"))
		}

		w.WriteHeader(http.StatusOK)
		t_util.MustWrite(t, w, []byte(`success`))
	}))
	defer server.Close()

	inbox := model.Inbox{ID: uuid.New()}
	callback := model.Callback{
		IsEnabled: true,
		ToURL:     server.URL,
		Method:    "POST",
		Headers:   map[string]string{"Content-Type": "text/plain"},
		Body:      "plain text body",
	}
	request := createTestRequest()

	response := SendCallback(inbox, 0, callback, request)

	if response.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, response.Code)
	}
	if response.Body != "success" {
		t.Errorf("Expected body %s, got %s", "success", response.Body)
	}
}

func TestSendCallbacks_AllEnabled(t *testing.T) {
	// Create test servers for callbacks
	server1 := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"callback": 1}`))
	}))
	defer server1.Close()

	server2 := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		w.Write([]byte(`{"callback": 2}`))
	}))
	defer server2.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				ToURL:     server1.URL,
				Method:    "POST",
				Headers:   map[string]string{"Content-Type": "application/json"},
				Body:      `{"test": "data1"}`,
			},
			{
				IsEnabled: true,
				ToURL:     server2.URL,
				Method:    "POST",
				Headers:   map[string]string{"Content-Type": "application/json"},
				Body:      `{"test": "data2"}`,
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(inbox, request)

	if len(responses) != 2 {
		t.Errorf("Expected 2 responses, got %d", len(responses))
	}

	// Check first callback response
	if responses[0].Code != http.StatusOK {
		t.Errorf("Expected first callback status %d, got %d", http.StatusOK, responses[0].Code)
	}
	if responses[0].Body != `{"callback": 1}` {
		t.Errorf("Expected first callback body %s, got %s", `{"callback": 1}`, responses[0].Body)
	}

	// Check second callback response
	if responses[1].Code != http.StatusCreated {
		t.Errorf("Expected second callback status %d, got %d", http.StatusCreated, responses[1].Code)
	}
	if responses[1].Body != `{"callback": 2}` {
		t.Errorf("Expected second callback body %s, got %s", `{"callback": 2}`, responses[1].Body)
	}
}

func TestSendCallbacks_MixedEnabledDisabled(t *testing.T) {
	// Create test server for enabled callback
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"enabled": true}`))
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: false, // This should be skipped
				ToURL:     "http://should-not-be-called.com",
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				ToURL:     server.URL,
				Method:    "GET",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(inbox, request)

	if len(responses) != 3 {
		t.Errorf("Expected 3 responses (including disabled), got %d", len(responses))
	}

	// Check first callback response (enabled)
	if responses[0].Code != http.StatusOK {
		t.Errorf("Expected first callback status %d, got %d", http.StatusOK, responses[0].Code)
	}

	// Check second callback response (disabled - should be zero value)
	if responses[1].Code != 0 {
		t.Errorf("Expected disabled callback to have zero status code, got %d", responses[1].Code)
	}
	if responses[1].Body != "" {
		t.Errorf("Expected disabled callback to have empty body, got %s", responses[1].Body)
	}

	// Check third callback response (enabled)
	if responses[2].Code != http.StatusOK {
		t.Errorf("Expected third callback status %d, got %d", http.StatusOK, responses[2].Code)
	}
}

func TestSendCallbacks_EmptyCallbacks(t *testing.T) {
	inbox := model.Inbox{
		ID:        uuid.New(),
		Name:      "test-inbox",
		Callbacks: []model.Callback{}, // No callbacks
	}
	request := createTestRequest()

	responses := SendCallbacks(inbox, request)

	if len(responses) != 0 {
		t.Errorf("Expected 0 responses for empty callbacks, got %d", len(responses))
	}
}

func TestSendCallbacks_AllDisabled(t *testing.T) {
	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: false,
				ToURL:     "http://should-not-be-called.com",
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: false,
				ToURL:     "http://should-not-be-called2.com",
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(inbox, request)

	if len(responses) != 2 {
		t.Errorf("Expected 2 responses (for disabled callbacks), got %d", len(responses))
	}

	// All responses should be zero values since callbacks are disabled
	for i, response := range responses {
		if response.Code != 0 {
			t.Errorf("Expected disabled callback %d to have zero status code, got %d", i, response.Code)
		}
		if response.Body != "" {
			t.Errorf("Expected disabled callback %d to have empty body, got %s", i, response.Body)
		}
	}
}

func TestSendCallbacks_ErrorHandling(t *testing.T) {
	// Create server that sometimes fails
	callCount := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		callCount++
		if callCount%2 == 0 {
			// Every second call fails
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(`{"error": "server error"}`))
		} else {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success": true}`))
		}
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(inbox, request)

	if len(responses) != 2 {
		t.Errorf("Expected 2 responses, got %d", len(responses))
	}

	// One should succeed, one should fail
	successCount := 0
	errorCount := 0
	for _, response := range responses {
		switch response.Code {
		case http.StatusOK:
			successCount++
		case http.StatusInternalServerError:
			errorCount++
		}
	}

	if successCount != 1 || errorCount != 1 {
		t.Errorf("Expected 1 success and 1 error, got %d success and %d error", successCount, errorCount)
	}
}

func TestSendCallbacks_Concurrency(t *testing.T) {
	// Test that callbacks are executed concurrently by measuring execution time
	delay := 100 * time.Millisecond
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(delay) // Simulate slow callback
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"delayed": true}`))
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	start := time.Now()
	responses := SendCallbacks(inbox, request)
	duration := time.Since(start)

	if len(responses) != 3 {
		t.Errorf("Expected 3 responses, got %d", len(responses))
	}

	// If running sequentially, it would take at least 3 * delay
	// If running concurrently, it should take approximately delay
	maxExpectedDuration := delay + 50*time.Millisecond // Add some buffer for overhead
	if duration > maxExpectedDuration*2 {
		t.Errorf("Callbacks appear to be running sequentially. Expected duration < %v, got %v", maxExpectedDuration*2, duration)
	}

	// Verify all callbacks completed successfully
	for i, response := range responses {
		if response.Code != http.StatusOK {
			t.Errorf("Expected callback %d status %d, got %d", i, http.StatusOK, response.Code)
		}
	}
}
