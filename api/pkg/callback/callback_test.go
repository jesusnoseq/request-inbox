package callback

import (
	"context"
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
	// Disable URL validation for tests to allow localhost callbacks
	config.Set(config.EnableCallbackURLValidation, false)
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
		t_util.MustWrite(t, w, []byte(`{"callback": 1}`))
	}))
	defer server1.Close()

	server2 := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusCreated)
		t_util.MustWrite(t, w, []byte(`{"callback": 2}`))
	}))
	defer server2.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				IsDynamic: false, // Ensure non-dynamic to avoid parsing issues
				ToURL:     server1.URL,
				Method:    "POST",
				Headers:   map[string]string{"Content-Type": "application/json"},
				Body:      `{"test": "data1"}`,
			},
			{
				IsEnabled: true,
				IsDynamic: false, // Ensure non-dynamic to avoid parsing issues
				ToURL:     server2.URL,
				Method:    "POST",
				Headers:   map[string]string{"Content-Type": "application/json"},
				Body:      `{"test": "data2"}`,
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(context.Background(), inbox, request)

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
		t_util.MustWrite(t, w, []byte(`{"enabled": true}`))
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: false, // This should be skipped
				IsDynamic: false,
				ToURL:     "http://should-not-be-called.com",
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     server.URL,
				Method:    "GET",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(context.Background(), inbox, request)

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

	responses := SendCallbacks(context.Background(), inbox, request)

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
				IsDynamic: false,
				ToURL:     "http://should-not-be-called.com",
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: false,
				IsDynamic: false,
				ToURL:     "http://should-not-be-called2.com",
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(context.Background(), inbox, request)

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
			t_util.MustWrite(t, w, []byte(`{"error": "server error"}`))
		} else {
			w.WriteHeader(http.StatusOK)
			t_util.MustWrite(t, w, []byte(`{"success": true}`))
		}
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(context.Background(), inbox, request)

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
		t_util.MustWrite(t, w, []byte(`{"delayed": true}`))
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     server.URL,
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	start := time.Now()
	responses := SendCallbacks(context.Background(), inbox, request)
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

func TestSendCallbacks_DynamicCallbacks(t *testing.T) {
	// Create test server that will verify dynamic content
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// The server will receive different content based on dynamic templates
		if r.Header.Get("X-Inbox-Name") == "" {
			t.Error("Expected X-Inbox-Name header to be set dynamically")
		}
		if r.Header.Get("X-Request-Method") == "" {
			t.Error("Expected X-Request-Method header to be set dynamically")
		}
		if r.Header.Get("X-Request-URI") == "" {
			t.Error("Expected X-Request-URI header to be set dynamically")
		}

		// Verify that the body contains dynamic content
		if !strings.Contains(r.Header.Get("X-Inbox-Name"), "dynamic-test-inbox") {
			t.Errorf("Expected inbox name in header, got %s", r.Header.Get("X-Inbox-Name"))
		}
		if !strings.Contains(r.Header.Get("X-Request-Method"), "POST") {
			t.Errorf("Expected request method in header, got %s", r.Header.Get("X-Request-Method"))
		}
		if !strings.Contains(r.Header.Get("X-Request-URI"), "/test") {
			t.Errorf("Expected request URI in header, got %s", r.Header.Get("X-Request-URI"))
		}

		w.WriteHeader(http.StatusOK)
		t_util.MustWrite(t, w, []byte(`{"dynamic": "response"}`))
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "dynamic-test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				IsDynamic: true, // Enable dynamic parsing
				ToURL:     server.URL,
				Method:    "{{.Request.Method}}", // Dynamic method from request
				Headers: map[string]string{
					"Content-Type":     "application/json",
					"X-Inbox-Name":     "{{.Inbox.Name}}",             // Dynamic inbox name
					"X-Request-Method": "{{.Request.Method}}",         // Dynamic request method
					"X-Request-URI":    "{{.Request.URI}}",            // Dynamic request URI
					"X-Request-Host":   "{{.Request.Host}}",           // Dynamic request host
					"X-Callback-Index": "{{.Index}}",                  // Dynamic callback index
					"X-Upper-Method":   "{{toUpper .Request.Method}}", // Using template function
				},
				Body: `{"original_method": "{{.Request.Method}}", "inbox_name": "{{.Inbox.Name}}", "uri": "{{.Request.URI}}"}`,
			},
			{
				IsEnabled: true,
				IsDynamic: true,
				ToURL:     server.URL + "/callback-{{.Index}}", // Dynamic URL with index
				Method:    "POST",
				Headers: map[string]string{
					"Content-Type":     "application/json",
					"X-Inbox-Name":     "{{toLower .Inbox.Name}}", // Using toLower function
					"X-Request-Method": "{{.Request.Method}}",
					"X-Request-URI":    "{{.Request.URI}}",
				},
				Body: `{"callback_index": {{.Index}}, "request_body": {{.Request.Body}}}`,
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(context.Background(), inbox, request)

	if len(responses) != 2 {
		t.Errorf("Expected 2 responses, got %d", len(responses))
	}

	// Check first dynamic callback response
	if responses[0].Code != http.StatusOK {
		t.Errorf("Expected first callback status %d, got %d", http.StatusOK, responses[0].Code)
	}
	if responses[0].Method != "POST" { // Should be parsed from Request.Method
		t.Errorf("Expected first callback method POST, got %s", responses[0].Method)
	}
	if responses[0].URL != server.URL {
		t.Errorf("Expected first callback URL %s, got %s", server.URL, responses[0].URL)
	}

	// Check second dynamic callback response
	if responses[1].Code != http.StatusOK {
		t.Errorf("Expected second callback status %d, got %d", http.StatusOK, responses[1].Code)
	}
	expectedURL := server.URL + "/callback-1"
	if responses[1].URL != expectedURL {
		t.Errorf("Expected second callback URL %s, got %s", expectedURL, responses[1].URL)
	}
}

func TestSendCallbacks_DynamicCallbacksWithJSONPath(t *testing.T) {
	// Create test server that will verify gjsonPath functionality
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify that gjsonPath extracted the correct value
		if r.Header.Get("X-Extracted-Value") != "request" {
			t.Errorf("Expected X-Extracted-Value to be 'request', got %s", r.Header.Get("X-Extracted-Value"))
		}

		w.WriteHeader(http.StatusOK)
		t_util.MustWrite(t, w, []byte(`{"gjson": "success"}`))
	}))
	defer server.Close()

	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "gjson-test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				IsDynamic: true,
				ToURL:     server.URL,
				Method:    "POST",
				Headers: map[string]string{
					"Content-Type":      "application/json",
					"X-Extracted-Value": `{{gjsonPath .Request.Body "incoming"}}`,                       // Extract "incoming" field from JSON body
					"X-Default-Value":   `{{gjsonPathOrDefault .Request.Body "nonexistent" "default"}}`, // Test default value
				},
				Body: `{"extracted": "{{gjsonPath .Request.Body "incoming"}}"}`,
			},
		},
	}
	request := createTestRequest() // This has Body: `{"incoming": "request"}`

	responses := SendCallbacks(context.Background(), inbox, request)

	if len(responses) != 1 {
		t.Errorf("Expected 1 response, got %d", len(responses))
	}

	if responses[0].Code != http.StatusOK {
		t.Errorf("Expected callback status %d, got %d", http.StatusOK, responses[0].Code)
	}
	if responses[0].Body != `{"gjson": "success"}` {
		t.Errorf("Expected callback body %s, got %s", `{"gjson": "success"}`, responses[0].Body)
	}
}

func TestSendCallbacks_DynamicCallbacksError(t *testing.T) {
	inbox := model.Inbox{
		ID:   uuid.New(),
		Name: "error-test-inbox",
		Callbacks: []model.Callback{
			{
				IsEnabled: true,
				IsDynamic: true,
				ToURL:     "{{.Invalid.Field}}", // This should cause a template error
				Method:    "POST",
				Headers:   map[string]string{},
				Body:      "",
			},
		},
	}
	request := createTestRequest()

	responses := SendCallbacks(context.Background(), inbox, request)

	// When there's a parsing error, SendCallbacks should return empty responses
	if len(responses) != 1 {
		t.Errorf("Expected 1 response (empty due to error), got %d", len(responses))
	}

	// The response should be empty/zero value due to parsing error
	if responses[0].Code != 0 {
		t.Errorf("Expected empty response due to parsing error, got code %d", responses[0].Code)
	}
	if responses[0].URL != "<no value>" { // Template parsing produces "<no value>" for invalid fields
		t.Errorf("Expected '<no value>' URL due to parsing error, got %s", responses[0].URL)
	}
	if responses[0].Error == "" {
		t.Error("Expected error message in response")
	}
}
