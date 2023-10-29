package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func performRequest(r http.Handler, method, path string, body string) *httptest.ResponseRecorder {
	req, _ := http.NewRequest(method, path, strings.NewReader(body))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func TestCreateInbox(t *testing.T) {
	r := gin.Default()
	r.POST("/api/v1/inboxs/", CreateInbox)

	body := `{"Response":"Test Response"}`
	w := performRequest(r, "POST", "/api/v1/inboxs/", body)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status %d; got %d", http.StatusCreated, w.Code)
	}

	// Add more assertions for the response and inbox creation as needed.
	// Example: check if the response contains the newly created inbox data.
}

// Add more test cases for other handlers (ListInboxs, DeleteInbox, GetInbox, InboxRequest) as needed.

func TestListInboxs(t *testing.T) {
	// Implement test cases for ListInboxs handler
}

func TestDeleteInbox(t *testing.T) {
	// Implement test cases for DeleteInbox handler
}

func TestGetInbox(t *testing.T) {
	// Implement test cases for GetInbox handler
}

func TestInboxRequest(t *testing.T) {
	// Implement test cases for InboxRequest handler
}
