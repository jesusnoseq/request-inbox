package mcpserver

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sort"
	"testing"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type rpcResponse struct {
	Result struct {
		Tools []struct {
			Name        string          `json:"name"`
			InputSchema json.RawMessage `json:"inputSchema"`
		} `json:"tools"`
		StructuredContent json.RawMessage `json:"structuredContent"`
		IsError           bool            `json:"isError"`
		Content           []struct {
			Text string `json:"text"`
		} `json:"content"`
	} `json:"result"`
	Error json.RawMessage `json:"error"`
}

func newTestServer(t *testing.T) (*Server, database.Repository) {
	t.Helper()
	config.LoadConfig(config.Test)
	dao, err := database.NewRepository(context.Background(), database.Badger)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := dao.Close(context.Background()); err != nil {
			t.Error(err)
		}
	})
	return New(dao, &event.NoOpEventTracker{}), dao
}

func callRPC(t *testing.T, server http.Handler, ctx context.Context, method string, params any) rpcResponse {
	t.Helper()
	payload, err := json.Marshal(map[string]any{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  method,
		"params":  params,
	})
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPost, "/mcp", bytes.NewReader(payload)).WithContext(ctx)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json, text/event-stream")
	recorder := httptest.NewRecorder()
	server.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("MCP request returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var response rpcResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode MCP response: %v; body: %s", err, recorder.Body.String())
	}
	if len(response.Error) > 0 && string(response.Error) != "null" {
		t.Fatalf("unexpected MCP protocol error: %s", response.Error)
	}
	return response
}

func callTool(t *testing.T, server http.Handler, ctx context.Context, name string, arguments any, output any) rpcResponse {
	t.Helper()
	response := callRPC(t, server, ctx, "tools/call", map[string]any{
		"name":      name,
		"arguments": arguments,
	})
	if output != nil && !response.Result.IsError {
		if err := json.Unmarshal(response.Result.StructuredContent, output); err != nil {
			t.Fatalf("decode %s output: %v; content: %s", name, err, response.Result.StructuredContent)
		}
	}
	return response
}

func TestServerAdvertisesOnlyRequestedTools(t *testing.T) {
	server, _ := newTestServer(t)
	ctx := WithRequestContext(context.Background(), nil, "https://api.example.com")
	callRPC(t, server, ctx, "initialize", map[string]any{
		"protocolVersion": "2025-06-18",
		"capabilities":    map[string]any{},
		"clientInfo": map[string]any{
			"name":    "request-inbox-test",
			"version": "1.0.0",
		},
	})
	response := callRPC(t, server, ctx, "tools/list", map[string]any{})

	names := make([]string, 0, len(response.Result.Tools))
	for _, tool := range response.Result.Tools {
		names = append(names, tool.Name)
	}
	sort.Strings(names)
	want := []string{
		"add_request_inbox_callback",
		"clear_request_inbox_requests",
		"create_request_inbox",
		"delete_request_inbox",
		"edit_request_inbox",
		"list_request_inbox_requests",
		"list_request_inboxes",
	}
	if len(names) != len(want) {
		t.Fatalf("got tools %v, want %v", names, want)
	}
	for i := range want {
		if names[i] != want[i] {
			t.Fatalf("got tools %v, want %v", names, want)
		}
	}
}

func TestMCPInboxLifecycle(t *testing.T) {
	server, dao := newTestServer(t)
	ctx := WithRequestContext(context.Background(), nil, "https://api.example.com")

	var created InboxOutput
	response := callTool(t, server, ctx, "create_request_inbox", map[string]any{"name": "MCP inbox"}, &created)
	if response.Result.IsError {
		t.Fatalf("create failed: %+v", response.Result.Content)
	}
	if created.Name != "MCP inbox" || created.Warning == "" {
		t.Fatalf("unexpected create output: %+v", created)
	}
	if created.CaptureURL != "https://api.example.com/api/v1/inboxes/"+created.InboxID+"/in" {
		t.Fatalf("unexpected capture URL: %s", created.CaptureURL)
	}

	var edited InboxOutput
	response = callTool(t, server, ctx, "edit_request_inbox", map[string]any{
		"inboxId": created.InboxID,
		"name":    "Edited MCP inbox",
		"response": map[string]any{
			"code": 201,
			"body": "accepted",
		},
	}, &edited)
	if response.Result.IsError || edited.Name != "Edited MCP inbox" || edited.Response.Code != 201 {
		t.Fatalf("unexpected edit output: %+v, errors: %+v", edited, response.Result.Content)
	}

	var callback AddCallbackOutput
	response = callTool(t, server, ctx, "add_request_inbox_callback", map[string]any{
		"inboxId":        created.InboxID,
		"destinationUrl": "https://example.com/webhook",
	}, &callback)
	if response.Result.IsError || callback.CallbackCount != 1 || callback.Callback.Method != http.MethodPost {
		t.Fatalf("unexpected callback output: %+v, errors: %+v", callback, response.Result.Content)
	}

	id := uuid.MustParse(created.InboxID)
	for requestID := 1; requestID <= 3; requestID++ {
		if err := dao.AddRequestToInbox(ctx, id, model.Request{ID: requestID, Method: http.MethodPost, URI: "/hook"}); err != nil {
			t.Fatal(err)
		}
	}

	var requests ListRequestsOutput
	response = callTool(t, server, ctx, "list_request_inbox_requests", map[string]any{
		"inboxId":        created.InboxID,
		"requestLimit":   1,
		"afterRequestId": 1,
	}, &requests)
	if response.Result.IsError || requests.ReturnedCount != 1 || requests.Requests[0].RequestID != 2 || !requests.HasMore || requests.NextAfterRequestID != 2 {
		t.Fatalf("unexpected request list: %+v, errors: %+v", requests, response.Result.Content)
	}

	var listed ListInboxesOutput
	response = callTool(t, server, ctx, "list_request_inboxes", map[string]any{}, &listed)
	if response.Result.IsError {
		t.Fatalf("list failed: %+v", response.Result.Content)
	}
	if listed.Count != 0 {
		t.Fatalf("anonymous listing should follow existing disabled-public-list behavior: %+v", listed)
	}

	var cleared ClearRequestsOutput
	response = callTool(t, server, ctx, "clear_request_inbox_requests", map[string]any{"inboxId": created.InboxID}, &cleared)
	if response.Result.IsError || !cleared.Cleared {
		t.Fatalf("clear failed: %+v", response.Result.Content)
	}
	inbox, err := dao.GetInboxWithRequests(ctx, id)
	if err != nil || len(inbox.Requests) != 0 {
		t.Fatalf("requests were not cleared: %+v, %v", inbox.Requests, err)
	}

	var deleted DeleteInboxOutput
	response = callTool(t, server, ctx, "delete_request_inbox", map[string]any{"inboxId": created.InboxID}, &deleted)
	if response.Result.IsError || !deleted.Deleted {
		t.Fatalf("delete failed: %+v", response.Result.Content)
	}
}

func TestMCPPrivateInboxPermissions(t *testing.T) {
	server, dao := newTestServer(t)
	owner := model.NewUser("owner@example.com")
	otherUser := model.NewUser("other@example.com")
	ownerContext := WithRequestContext(context.Background(), &owner, "https://api.example.com")

	var created InboxOutput
	response := callTool(t, server, ownerContext, "create_request_inbox", map[string]any{"isPrivate": true}, &created)
	if response.Result.IsError {
		t.Fatalf("private create failed: %+v", response.Result.Content)
	}
	stored, err := dao.GetInbox(context.Background(), uuid.MustParse(created.InboxID))
	if err != nil || stored.OwnerID != owner.ID {
		t.Fatalf("private inbox owner not persisted: %+v, %v", stored, err)
	}

	otherContext := WithRequestContext(context.Background(), &otherUser, "https://api.example.com")
	response = callTool(t, server, otherContext, "list_request_inbox_requests", map[string]any{"inboxId": created.InboxID}, nil)
	if !response.Result.IsError || len(response.Result.Content) == 0 || response.Result.Content[0].Text != "request inbox not found" {
		t.Fatalf("private inbox should be hidden: %+v", response.Result)
	}

	response = callTool(t, server, WithRequestContext(context.Background(), nil, "https://api.example.com"), "create_request_inbox", map[string]any{"isPrivate": true}, nil)
	if !response.Result.IsError {
		t.Fatal("anonymous private inbox creation should fail")
	}
}
