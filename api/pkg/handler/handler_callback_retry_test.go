package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

// allowLocalhostCallbacks lets the callbacks of a test reach the local test server, and restores
// the validation afterwards so the tests that rely on it are not affected.
func allowLocalhostCallbacks(t *testing.T) {
	previous := config.GetBool(config.EnableCallbackURLValidation)
	config.Set(config.EnableCallbackURLValidation, false)
	t.Cleanup(func() {
		config.Set(config.EnableCallbackURLValidation, previous)
	})
}

// callbackTargetServer answers every call with the given body and counts the calls received.
func callbackTargetServer(t *testing.T, body string) (*httptest.Server, *int) {
	calls := 0
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		t_util.MustWrite(t, w, []byte(body))
	}))
	t.Cleanup(server.Close)
	return server, &calls
}

func inboxWithCallbackTo(url string) model.Inbox {
	inbox := model.GenerateInbox()
	inbox.Requests = []model.Request{model.GenerateRequest(0)}
	inbox.Callbacks = []model.Callback{
		{
			IsEnabled: true,
			ToURL:     url,
			Method:    http.MethodPost,
			Headers:   map[string]string{"Content-Type": "application/json"},
			Body:      `{"event": "retried"}`,
		},
	}
	return inbox
}

// shouldExistInboxOfUser creates the inbox as user, the only way to get a private inbox stored.
func shouldExistInboxOfUser(t *testing.T, ih InboxController, i model.Inbox, user model.User) model.Inbox {
	t.Helper()
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	req, err := http.NewRequest(http.MethodPost, "", bytes.NewReader(t_util.MustJson(t, i)))
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	ginCtx.Request = req
	ginCtx.Set(login.USER_CONTEXT_KEY, user)
	ginCtx.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)

	ih.CreateInbox(ginCtx)

	if w.Code != http.StatusCreated {
		t.Fatalf("inbox should be created, got status %d, body: %s", w.Code, w.Body.String())
	}
	return mustParseInbox(w.Body.Bytes())
}

func retryCallback(t *testing.T, ih InboxController, inboxID, requestID, callbackIndex string) *httptest.ResponseRecorder {
	t.Helper()
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", inboxID)
	ginCtx.AddParam("requestID", requestID)
	ginCtx.AddParam("callbackIndex", callbackIndex)
	req, err := http.NewRequest(http.MethodPost, "", nil)
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}
	ginCtx.Request = req
	ih.RetryInboxRequestCallback(ginCtx)
	return w
}

func TestRetryInboxRequestCallback(t *testing.T) {
	config.LoadConfig(config.Test)
	allowLocalhostCallbacks(t)

	server, calls := callbackTargetServer(t, `{"retried": true}`)

	ih, closer := mustGetInboxHandler()
	defer closer()
	createdInbox := shouldExistInbox(t, ih, inboxWithCallbackTo(server.URL))

	w := retryCallback(t, ih, createdInbox.ID.String(), "0", "0")

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d, body: %s", http.StatusOK, w.Code, w.Body.String())
	}
	if *calls != 1 {
		t.Errorf("Expected the callback target to be called once, got %d calls", *calls)
	}

	cbResp := model.CallbackResponse{}
	if err := json.Unmarshal(w.Body.Bytes(), &cbResp); err != nil {
		t.Fatalf("Failed to parse callback response: %v", err)
	}
	if cbResp.Code != http.StatusOK {
		t.Errorf("Expected callback status code %d, got %d", http.StatusOK, cbResp.Code)
	}
	if cbResp.Body != `{"retried": true}` {
		t.Errorf("Unexpected callback response body: %s", cbResp.Body)
	}
	if cbResp.URL != server.URL {
		t.Errorf("Expected callback URL %s, got %s", server.URL, cbResp.URL)
	}
	if cbResp.Error != "" {
		t.Errorf("Expected no callback error, got %s", cbResp.Error)
	}
}

func TestRetryInboxRequestCallbackKeepsStoredResponses(t *testing.T) {
	config.LoadConfig(config.Test)
	allowLocalhostCallbacks(t)

	server, _ := callbackTargetServer(t, `{"retried": true}`)

	ih, closer := mustGetInboxHandler()
	defer closer()
	createdInbox := shouldExistInbox(t, ih, inboxWithCallbackTo(server.URL))
	stored := createdInbox.Requests[0].CallbackResponses

	w := retryCallback(t, ih, createdInbox.ID.String(), "0", "0")
	if w.Code != http.StatusOK {
		t.Fatalf("Expected status %d, got %d, body: %s", http.StatusOK, w.Code, w.Body.String())
	}

	updatedInbox := getInbox(t, ih, createdInbox.ID)
	got := updatedInbox.Requests[0].CallbackResponses
	if len(got) != len(stored) {
		t.Fatalf("Expected %d stored callback responses, got %d", len(stored), len(got))
	}
	if got[0].Body != stored[0].Body {
		t.Errorf("Expected the stored callback response to stay %q, got %q", stored[0].Body, got[0].Body)
	}
}

func TestRetryInboxRequestCallbackErrors(t *testing.T) {
	config.LoadConfig(config.Test)
	allowLocalhostCallbacks(t)

	server, _ := callbackTargetServer(t, `{"retried": true}`)

	ih, closer := mustGetInboxHandler()
	defer closer()
	createdInbox := shouldExistInbox(t, ih, inboxWithCallbackTo(server.URL))

	disabledCallbackInbox := inboxWithCallbackTo(server.URL)
	disabledCallbackInbox.Callbacks[0].IsEnabled = false
	createdDisabledInbox := shouldExistInbox(t, ih, disabledCallbackInbox)

	tests := []struct {
		name          string
		inboxID       string
		requestID     string
		callbackIndex string
		wantStatus    int
	}{
		{"invalid inbox ID", "not-an-uuid", "0", "0", http.StatusBadRequest},
		{"invalid request ID", createdInbox.ID.String(), "not-a-number", "0", http.StatusBadRequest},
		{"invalid callback index", createdInbox.ID.String(), "0", "not-a-number", http.StatusBadRequest},
		{"unknown inbox", uuid.New().String(), "0", "0", http.StatusInternalServerError},
		{"unknown request", createdInbox.ID.String(), "42", "0", http.StatusNotFound},
		{"callback index out of range", createdInbox.ID.String(), "0", "7", http.StatusNotFound},
		{"negative callback index", createdInbox.ID.String(), "0", "-1", http.StatusNotFound},
		{"disabled callback", createdDisabledInbox.ID.String(), "0", "0", http.StatusBadRequest},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := retryCallback(t, ih, tt.inboxID, tt.requestID, tt.callbackIndex)
			if w.Code != tt.wantStatus {
				t.Errorf("Expected status %d, got %d, body: %s", tt.wantStatus, w.Code, w.Body.String())
			}
		})
	}
}

func TestRetryInboxRequestCallbackOnPrivateInbox(t *testing.T) {
	config.LoadConfig(config.Test)
	allowLocalhostCallbacks(t)

	server, calls := callbackTargetServer(t, `{"retried": true}`)

	ih, closer := mustGetInboxHandler()
	defer closer()
	inbox := inboxWithCallbackTo(server.URL)
	inbox.IsPrivate = true
	createdInbox := shouldExistInboxOfUser(t, ih, inbox, model.GenerateUser())

	w := retryCallback(t, ih, createdInbox.ID.String(), "0", "0")

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status %d for an anonymous retry on a private inbox, got %d, body: %s",
			http.StatusNotFound, w.Code, w.Body.String())
	}
	if *calls != 0 {
		t.Errorf("Expected the callback target not to be called, got %d calls", *calls)
	}
}
