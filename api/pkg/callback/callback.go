package callback

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/dynamic_response"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

// SendCallbacks sends all enabled callbacks for an inbox concurrently and returns their responses
func SendCallbacks(c context.Context, inbox model.Inbox, request model.Request) []model.CallbackResponse {
	callbackResponse := make([]model.CallbackResponse, len(inbox.Callbacks))
	var wg sync.WaitGroup
	callbacks, err := dynamic_response.ParseCallbacks(c, inbox, request)
	if err != nil {
		slog.Error("Error parsing callbacks", "error", err, "inbox_id", inbox.ID)
		return callbackResponse
	}
	for k, cb := range callbacks {
		if !cb.IsEnabled {
			continue
		}
		wg.Add(1)
		go func(k int, cb model.Callback) {
			defer wg.Done()
			cbResp := SendCallback(inbox, k, cb, request)
			slog.Info("callback response received",
				"inbox_id", inbox.ID,
				"callback_index", k,
				"url", cbResp.URL,
				"method", cbResp.Method,
				"status_code", cbResp.Code,
				"error", cbResp.Error,
				"response_body", cbResp.Body)
			callbackResponse[k] = cbResp
		}(k, cb)
	}
	wg.Wait()

	return callbackResponse
}

// SendCallback sends a single callback request and returns the response
func SendCallback(inbox model.Inbox, k int, c model.Callback, request model.Request) model.CallbackResponse {
	response := model.CallbackResponse{
		URL:     c.ToURL,
		Method:  c.Method,
		Error:   "",
		Code:    0,
		Body:    "",
		Headers: make(map[string]string),
	}

	// Create a copy of the callback for dynamic parsing if needed
	callbackCopy := c

	// Create HTTP client with timeout from config
	timeout := time.Duration(config.GetInt(config.CallbackTimeoutSeconds)) * time.Second
	client := &http.Client{
		Timeout: timeout,
	}

	// Prepare request body
	var bodyReader io.Reader
	if callbackCopy.Body != "" {
		bodyReader = bytes.NewBufferString(callbackCopy.Body)
	}

	// Create HTTP request
	req, err := http.NewRequest(callbackCopy.Method, callbackCopy.ToURL, bodyReader)
	if err != nil {
		response.Error = fmt.Sprintf("Error creating callback request: %v", err)
		return response
	}

	// Set headers
	for key, value := range callbackCopy.Headers {
		req.Header.Set(key, value)
	}

	// Set default Content-Type if not specified and body is present
	if callbackCopy.Body != "" && req.Header.Get("Content-Type") == "" {
		req.Header.Set("Content-Type", "application/json")
	}

	// Make the HTTP request
	resp, err := client.Do(req)
	if err != nil {
		response.Error = fmt.Sprintf("Error sending callback request: %v", err)
		return response
	}
	defer func() {
		err := resp.Body.Close()
		if err != nil {
			response.Error = fmt.Sprintf("Error closing response body: %v", err)
			slog.Error("Error closing callback response body", "error", err, "inbox_id", inbox.ID, "callback_index", k)
		}
	}()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Error = fmt.Sprintf("Error reading callback response: %v", err)
		return response
	}

	// Convert response headers to map[string]string
	headers := make(map[string]string)
	for key, values := range resp.Header {
		if len(values) > 0 {
			headers[key] = values[0] // Take the first value if multiple exist
		}
	}

	// Create successful response
	response = model.CallbackResponse{
		URL:     callbackCopy.ToURL,
		Method:  callbackCopy.Method,
		Error:   "",
		Code:    resp.StatusCode,
		Body:    string(respBody),
		Headers: headers,
	}

	return response
}
