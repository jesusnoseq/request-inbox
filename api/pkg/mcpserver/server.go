package mcpserver

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"sort"
	"strings"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/database/dberrors"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
	"github.com/modelcontextprotocol/go-sdk/mcp"
)

type requestContextKey struct{}

type requestContext struct {
	user    *model.User
	baseURL string
}

type Server struct {
	dao          database.Repository
	eventTracker event.EventTracker
	httpHandler  *mcp.StreamableHTTPHandler
}

func New(dao database.Repository, eventTracker event.EventTracker) *Server {
	s := &Server{dao: dao, eventTracker: eventTracker}
	version := config.GetString(config.Version)
	if version == "" {
		version = "dev"
	}
	protocolServer := mcp.NewServer(
		&mcp.Implementation{Name: "request-inbox", Version: version},
		&mcp.ServerOptions{Instructions: "Create and manage HTTP request inboxes and inspect captured requests."},
	)
	s.registerTools(protocolServer)
	s.httpHandler = mcp.NewStreamableHTTPHandler(
		func(*http.Request) *mcp.Server { return protocolServer },
		&mcp.StreamableHTTPOptions{Stateless: true, JSONResponse: true},
	)
	return s
}

func WithRequestContext(ctx context.Context, user *model.User, baseURL string) context.Context {
	return context.WithValue(ctx, requestContextKey{}, requestContext{user: user, baseURL: strings.TrimRight(baseURL, "/")})
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.httpHandler.ServeHTTP(w, r)
}

func (s *Server) registerTools(server *mcp.Server) {
	closedWorld := false
	destructive := true
	nondestructive := false

	mcp.AddTool(server, &mcp.Tool{
		Name:        "create_request_inbox",
		Title:       "Create Request Inbox",
		Description: "Create an HTTP request inbox for webhook testing.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &nondestructive, OpenWorldHint: &closedWorld},
	}, s.createInbox)
	mcp.AddTool(server, &mcp.Tool{
		Name:        "edit_request_inbox",
		Title:       "Edit Request Inbox",
		Description: "Edit an inbox name, privacy, response, or header obfuscation settings without changing captured requests or callbacks.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &nondestructive, IdempotentHint: true, OpenWorldHint: &closedWorld},
	}, s.editInbox)
	mcp.AddTool(server, &mcp.Tool{
		Name:        "list_request_inboxes",
		Title:       "List Request Inboxes",
		Description: "List request inboxes available to the current user, newest first.",
		Annotations: &mcp.ToolAnnotations{ReadOnlyHint: true, OpenWorldHint: &closedWorld},
	}, s.listInboxes)
	mcp.AddTool(server, &mcp.Tool{
		Name:        "add_request_inbox_callback",
		Title:       "Add Request Inbox Callback",
		Description: "Add a callback that runs whenever a request is captured by the inbox.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &nondestructive},
	}, s.addCallback)
	mcp.AddTool(server, &mcp.Tool{
		Name:        "delete_request_inbox",
		Title:       "Delete Request Inbox",
		Description: "Permanently delete a request inbox and its captured requests.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &destructive, IdempotentHint: true, OpenWorldHint: &closedWorld},
	}, s.deleteInbox)
	mcp.AddTool(server, &mcp.Tool{
		Name:        "clear_request_inbox_requests",
		Title:       "Clear Request Inbox Requests",
		Description: "Permanently remove all captured requests while preserving inbox configuration.",
		Annotations: &mcp.ToolAnnotations{DestructiveHint: &destructive, IdempotentHint: true, OpenWorldHint: &closedWorld},
	}, s.clearRequests)
	mcp.AddTool(server, &mcp.Tool{
		Name:        "list_request_inbox_requests",
		Title:       "List Request Inbox Requests",
		Description: "List captured requests. Use afterRequestId with nextAfterRequestId to poll for new traffic.",
		Annotations: &mcp.ToolAnnotations{ReadOnlyHint: true, OpenWorldHint: &closedWorld},
	}, s.listRequests)
}

func (s *Server) createInbox(ctx context.Context, _ *mcp.CallToolRequest, input CreateInboxInput) (*mcp.CallToolResult, InboxOutput, error) {
	metadata := metadataFromContext(ctx)
	inbox := model.NewInbox()
	if input.Name != "" {
		inbox.Name = input.Name
	}
	if input.IsPrivate != nil {
		inbox.IsPrivate = *input.IsPrivate
	}
	if input.Response != nil {
		applyResponseInput(&inbox.Response, input.Response)
	}
	if input.ObfuscateHeaderFields != nil {
		inbox.ObfuscateHeaderFields = input.ObfuscateHeaderFields
	}
	if metadata.user != nil {
		inbox.OwnerID = metadata.user.ID
	}
	if inbox.IsPrivate && metadata.user == nil {
		return nil, InboxOutput{}, errors.New("authentication is required to create a private request inbox")
	}
	if valid, err := validation.IsValidInbox(inbox); !valid {
		return nil, InboxOutput{}, err
	}

	created, err := s.dao.CreateInbox(ctx, inbox)
	if err != nil {
		return nil, InboxOutput{}, errors.New("failed to create request inbox")
	}
	// The embedded repository always assigns the generated ID as the initial name.
	if input.Name != "" && created.Name != input.Name {
		created.Name = input.Name
		created, err = s.dao.UpdateInbox(ctx, created)
		if err != nil {
			return nil, InboxOutput{}, errors.New("failed to set request inbox name")
		}
	}
	if s.eventTracker != nil {
		userID := "anonymous"
		if created.OwnerID != uuid.Nil {
			userID = created.OwnerID.String()
		}
		if err := s.eventTracker.Track(ctx, event.CreateNewInboxEvent{
			BaseEvent: event.BaseEvent{UserID: userID},
			InboxID:   created.ID.String(),
		}); err != nil {
			slog.ErrorContext(ctx, "failed to track MCP inbox creation", "error", err)
		}
	}
	return nil, describeInbox(created, metadata.baseURL), nil
}

func (s *Server) editInbox(ctx context.Context, _ *mcp.CallToolRequest, input EditInboxInput) (*mcp.CallToolResult, InboxOutput, error) {
	id, err := parseInboxID(input.InboxID)
	if err != nil {
		return nil, InboxOutput{}, err
	}
	if input.Name == nil && input.IsPrivate == nil && input.Response == nil && input.ObfuscateHeaderFields == nil {
		return nil, InboxOutput{}, errors.New("at least one editable field is required")
	}
	inbox, err := s.dao.GetInbox(ctx, id)
	if err != nil {
		return nil, InboxOutput{}, repositoryError(err, "get")
	}
	if err := checkWritePermission(metadataFromContext(ctx).user, inbox); err != nil {
		return nil, InboxOutput{}, err
	}
	if input.Name != nil {
		inbox.Name = *input.Name
	}
	if input.IsPrivate != nil {
		inbox.IsPrivate = *input.IsPrivate
	}
	if input.Response != nil {
		applyResponseInput(&inbox.Response, input.Response)
	}
	if input.ObfuscateHeaderFields != nil {
		inbox.ObfuscateHeaderFields = *input.ObfuscateHeaderFields
	}
	if valid, err := validation.IsValidInbox(inbox); !valid {
		return nil, InboxOutput{}, err
	}
	updated, err := s.dao.UpdateInbox(ctx, inbox)
	if err != nil {
		return nil, InboxOutput{}, repositoryError(err, "update")
	}
	return nil, describeInbox(updated, metadataFromContext(ctx).baseURL), nil
}

func (s *Server) listInboxes(ctx context.Context, _ *mcp.CallToolRequest, _ EmptyInput) (*mcp.CallToolResult, ListInboxesOutput, error) {
	metadata := metadataFromContext(ctx)
	var (
		inboxes []model.Inbox
		err     error
	)
	if metadata.user != nil {
		inboxes, err = s.dao.ListInboxByUser(ctx, metadata.user.ID)
	} else if config.GetBool(config.EnableListingPublicInbox) {
		inboxes, err = s.dao.ListInbox(ctx)
	} else {
		inboxes = []model.Inbox{}
	}
	if err != nil {
		return nil, ListInboxesOutput{}, errors.New("failed to list request inboxes")
	}
	sort.Slice(inboxes, func(i, j int) bool { return inboxes[i].Timestamp > inboxes[j].Timestamp })
	results := make([]InboxSummary, 0, len(inboxes))
	for _, inbox := range inboxes {
		results = append(results, summarizeInbox(inbox, metadata.baseURL))
	}
	return nil, ListInboxesOutput{Inboxes: results, Count: len(results)}, nil
}

func (s *Server) addCallback(ctx context.Context, _ *mcp.CallToolRequest, input AddCallbackInput) (*mcp.CallToolResult, AddCallbackOutput, error) {
	id, err := parseInboxID(input.InboxID)
	if err != nil {
		return nil, AddCallbackOutput{}, err
	}
	if strings.TrimSpace(input.DestinationURL) == "" {
		return nil, AddCallbackOutput{}, errors.New("destinationUrl is required")
	}
	inbox, err := s.dao.GetInbox(ctx, id)
	if err != nil {
		return nil, AddCallbackOutput{}, repositoryError(err, "get")
	}
	if err := checkWritePermission(metadataFromContext(ctx).user, inbox); err != nil {
		return nil, AddCallbackOutput{}, err
	}
	callback := model.NewCallback()
	callback.ToURL = strings.TrimSpace(input.DestinationURL)
	callback.Method = strings.TrimSpace(input.Method)
	if callback.Method == "" {
		callback.Method = http.MethodPost
	}
	if input.Headers != nil {
		callback.Headers = input.Headers
	}
	callback.Body = input.Body
	callback.IsEnabled = true
	if input.IsEnabled != nil {
		callback.IsEnabled = *input.IsEnabled
	}
	if input.IsDynamic != nil {
		callback.IsDynamic = *input.IsDynamic
	}
	if input.ForwardHeaders != nil {
		callback.IsForwardingHeaders = *input.ForwardHeaders
	}
	inbox.Callbacks = append(inbox.Callbacks, callback)
	if valid, err := validation.IsValidInbox(inbox); !valid {
		return nil, AddCallbackOutput{}, err
	}
	updated, err := s.dao.UpdateInbox(ctx, inbox)
	if err != nil {
		return nil, AddCallbackOutput{}, repositoryError(err, "update")
	}
	index := len(updated.Callbacks) - 1
	return nil, AddCallbackOutput{
		InboxID:       updated.ID.String(),
		CallbackIndex: index,
		CallbackCount: len(updated.Callbacks),
		Callback:      describeCallback(updated.Callbacks[index]),
	}, nil
}

func (s *Server) deleteInbox(ctx context.Context, _ *mcp.CallToolRequest, input InboxIDInput) (*mcp.CallToolResult, DeleteInboxOutput, error) {
	id, err := parseInboxID(input.InboxID)
	if err != nil {
		return nil, DeleteInboxOutput{}, err
	}
	inbox, err := s.dao.GetInbox(ctx, id)
	if err != nil {
		return nil, DeleteInboxOutput{}, repositoryError(err, "get")
	}
	if err := checkWritePermission(metadataFromContext(ctx).user, inbox); err != nil {
		return nil, DeleteInboxOutput{}, err
	}
	if err := s.dao.DeleteInbox(ctx, id); err != nil {
		return nil, DeleteInboxOutput{}, repositoryError(err, "delete")
	}
	return nil, DeleteInboxOutput{InboxID: id.String(), Deleted: true}, nil
}

func (s *Server) clearRequests(ctx context.Context, _ *mcp.CallToolRequest, input InboxIDInput) (*mcp.CallToolResult, ClearRequestsOutput, error) {
	id, err := parseInboxID(input.InboxID)
	if err != nil {
		return nil, ClearRequestsOutput{}, err
	}
	inbox, err := s.dao.GetInbox(ctx, id)
	if err != nil {
		return nil, ClearRequestsOutput{}, repositoryError(err, "get")
	}
	if err := checkWritePermission(metadataFromContext(ctx).user, inbox); err != nil {
		return nil, ClearRequestsOutput{}, err
	}
	if err := s.dao.DeleteInboxRequests(ctx, id); err != nil {
		return nil, ClearRequestsOutput{}, repositoryError(err, "clear")
	}
	return nil, ClearRequestsOutput{InboxID: id.String(), Cleared: true}, nil
}

func (s *Server) listRequests(ctx context.Context, _ *mcp.CallToolRequest, input ListRequestsInput) (*mcp.CallToolResult, ListRequestsOutput, error) {
	id, err := parseInboxID(input.InboxID)
	if err != nil {
		return nil, ListRequestsOutput{}, err
	}
	limit := input.RequestLimit
	if limit == 0 {
		limit = 5
	}
	if limit < 1 || limit > 20 {
		return nil, ListRequestsOutput{}, errors.New("requestLimit must be between 1 and 20")
	}
	if input.AfterRequestID != nil && *input.AfterRequestID < 0 {
		return nil, ListRequestsOutput{}, errors.New("afterRequestId must not be negative")
	}
	inbox, err := s.dao.GetInboxWithRequests(ctx, id)
	if err != nil {
		return nil, ListRequestsOutput{}, repositoryError(err, "get")
	}
	if err := checkReadPermission(metadataFromContext(ctx).user, inbox); err != nil {
		return nil, ListRequestsOutput{}, err
	}

	matching := inbox.Requests
	if input.AfterRequestID != nil {
		matching = make([]model.Request, 0, len(inbox.Requests))
		for _, request := range inbox.Requests {
			if request.ID > *input.AfterRequestID {
				matching = append(matching, request)
			}
		}
	}
	start, end := 0, len(matching)
	if input.AfterRequestID == nil && end > limit {
		start = end - limit
	} else if input.AfterRequestID != nil && end > limit {
		end = limit
	}
	selected := matching[start:end]
	requests := make([]RequestOutput, 0, len(selected))
	for _, request := range selected {
		requests = append(requests, describeRequest(request))
	}
	nextID := 0
	if input.AfterRequestID != nil {
		nextID = *input.AfterRequestID
	}
	if len(selected) > 0 {
		nextID = selected[len(selected)-1].ID
	}
	return nil, ListRequestsOutput{
		InboxID:              id.String(),
		TotalRequestCount:    len(inbox.Requests),
		MatchingRequestCount: len(matching),
		ReturnedCount:        len(requests),
		HasMore:              input.AfterRequestID != nil && len(matching) > len(selected),
		NextAfterRequestID:   nextID,
		Requests:             requests,
	}, nil
}

func metadataFromContext(ctx context.Context) requestContext {
	metadata, _ := ctx.Value(requestContextKey{}).(requestContext)
	if metadata.baseURL == "" {
		metadata.baseURL = "https://" + config.GetString(config.BackendApplicationDomain)
	}
	return metadata
}

func parseInboxID(value string) (uuid.UUID, error) {
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return uuid.Nil, errors.New("inboxId must be a valid UUID")
	}
	return id, nil
}

func checkWritePermission(user *model.User, inbox model.Inbox) error {
	if inbox.OwnerID == uuid.Nil {
		return nil
	}
	if user == nil || user.ID != inbox.OwnerID {
		if inbox.IsPrivate {
			return errors.New("request inbox not found")
		}
		return errors.New("not allowed to modify request inbox")
	}
	return nil
}

func checkReadPermission(user *model.User, inbox model.Inbox) error {
	if inbox.OwnerID == uuid.Nil || !inbox.IsPrivate {
		return nil
	}
	if user == nil || user.ID != inbox.OwnerID {
		return errors.New("request inbox not found")
	}
	return nil
}

func repositoryError(err error, action string) error {
	if errors.Is(err, dberrors.ErrItemNotFound) {
		return errors.New("request inbox not found")
	}
	return fmt.Errorf("failed to %s request inbox", action)
}

func applyResponseInput(response *model.Response, input *ResponseInput) {
	if input.Code != nil {
		response.Code = *input.Code
	}
	if input.CodeTemplate != nil {
		response.CodeTemplate = *input.CodeTemplate
	}
	if input.Body != nil {
		response.Body = *input.Body
	}
	if input.Headers != nil {
		response.Headers = input.Headers
	}
	if input.IsDynamic != nil {
		response.IsDynamic = *input.IsDynamic
	}
}

func describeInbox(inbox model.Inbox, baseURL string) InboxOutput {
	obfuscateHeaderFields := inbox.ObfuscateHeaderFields
	if obfuscateHeaderFields == nil {
		obfuscateHeaderFields = []string{}
	}
	output := InboxOutput{
		InboxID:               inbox.ID.String(),
		Name:                  inbox.Name,
		Timestamp:             inbox.Timestamp,
		CaptureURL:            captureURL(baseURL, inbox.ID),
		DetailURL:             detailURL(inbox.ID),
		IsPrivate:             inbox.IsPrivate,
		Response:              describeResponse(inbox.Response),
		ObfuscateHeaderFields: obfuscateHeaderFields,
		CallbackCount:         len(inbox.Callbacks),
	}
	if inbox.OwnerID == uuid.Nil {
		output.Warning = "This inbox is anonymous and can be accessed or modified by anyone with its ID."
	}
	return output
}

func summarizeInbox(inbox model.Inbox, baseURL string) InboxSummary {
	return InboxSummary{
		InboxID:       inbox.ID.String(),
		Name:          inbox.Name,
		Timestamp:     inbox.Timestamp,
		CaptureURL:    captureURL(baseURL, inbox.ID),
		DetailURL:     detailURL(inbox.ID),
		IsPrivate:     inbox.IsPrivate,
		CallbackCount: len(inbox.Callbacks),
	}
}

func captureURL(baseURL string, id uuid.UUID) string {
	return strings.TrimRight(baseURL, "/") + "/api/v1/inboxes/" + id.String() + "/in"
}

func detailURL(id uuid.UUID) string {
	return strings.TrimRight(config.GetString(config.FrontendApplicationURL), "/") + "/inbox/" + id.String()
}

func describeResponse(response model.Response) ResponseOutput {
	headers := response.Headers
	if headers == nil {
		headers = map[string]string{}
	}
	return ResponseOutput{
		Code:         response.Code,
		CodeTemplate: response.CodeTemplate,
		Body:         response.Body,
		Headers:      headers,
		IsDynamic:    response.IsDynamic,
	}
}

func describeCallback(callback model.Callback) CallbackOutput {
	headers := callback.Headers
	if headers == nil {
		headers = map[string]string{}
	}
	return CallbackOutput{
		DestinationURL: callback.ToURL,
		Method:         callback.Method,
		Headers:        headers,
		Body:           callback.Body,
		IsEnabled:      callback.IsEnabled,
		IsDynamic:      callback.IsDynamic,
		ForwardHeaders: callback.IsForwardingHeaders,
	}
}

func describeRequest(request model.Request) RequestOutput {
	headers := request.Headers
	if headers == nil {
		headers = map[string][]string{}
	}
	return RequestOutput{
		RequestID:     request.ID,
		Timestamp:     request.Timestamp,
		Method:        request.Method,
		URI:           request.URI,
		Headers:       headers,
		Body:          request.Body,
		Host:          request.Host,
		RemoteAddress: request.RemoteAddr,
		Protocol:      request.Protocol,
		ContentLength: request.ContentLength,
	}
}
