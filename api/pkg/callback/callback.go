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
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
)

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
			isValid, err := validation.IsValidCallbackURL(cb.ToURL)
			if !isValid {
				slog.Error("Invalid callback URL", "error", err, "inbox_id", inbox.ID, "callback_index", k)
				callbackResponse[k] = model.CallbackResponse{
					Error: fmt.Sprintf("Invalid callback URL: %v", err),
				}
				return
			}
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

func SendCallback(inbox model.Inbox, k int, c model.Callback, request model.Request) model.CallbackResponse {
	response := model.CallbackResponse{
		URL:     c.ToURL,
		Method:  c.Method,
		Error:   "",
		Code:    0,
		Body:    "",
		Headers: make(map[string]string),
	}

	callbackCopy := c

	timeout := time.Duration(config.GetInt(config.CallbackTimeoutSeconds)) * time.Second
	client := &http.Client{
		Timeout: timeout,
	}

	var bodyReader io.Reader
	if callbackCopy.Body != "" {
		bodyReader = bytes.NewBufferString(callbackCopy.Body)
	}

	req, err := http.NewRequest(callbackCopy.Method, callbackCopy.ToURL, bodyReader)
	if err != nil {
		response.Error = fmt.Sprintf("Error creating callback request: %v", err)
		return response
	}

	for key, value := range callbackCopy.Headers {
		req.Header.Set(key, value)
	}

	// if callbackCopy.Body != "" && req.Header.Get("Content-Type") == "" {
	// 	req.Header.Set("Content-Type", "application/json")
	// }

	resp, err := client.Do(req)
	if err != nil {
		response.Error = fmt.Sprintf("Error sending callback request: %v", err)
		return response
	}
	defer func() {
		err := resp.Body.Close()
		if err != nil {
			slog.Error("Error closing callback response body", "error", err, "inbox_id", inbox.ID, "callback_index", k)
		}
	}()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Error = fmt.Sprintf("Error reading callback response: %v", err)
		return response
	}

	headers := make(map[string]string)
	for key, values := range resp.Header {
		if len(values) > 0 {
			headers[key] = values[0]
		}
	}

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
