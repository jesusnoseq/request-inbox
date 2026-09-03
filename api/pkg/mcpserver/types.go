package mcpserver

type EmptyInput struct{}

type ResponseInput struct {
	Code         *int              `json:"code,omitempty" jsonschema:"HTTP status code returned by the capture endpoint"`
	CodeTemplate *string           `json:"codeTemplate,omitempty" jsonschema:"Go template used to calculate a dynamic status code"`
	Body         *string           `json:"body,omitempty" jsonschema:"Response body returned by the capture endpoint"`
	Headers      map[string]string `json:"headers,omitempty" jsonschema:"Response headers returned by the capture endpoint"`
	IsDynamic    *bool             `json:"isDynamic,omitempty" jsonschema:"Whether response fields are rendered as Go templates"`
}

type CreateInboxInput struct {
	Name                  string         `json:"name,omitempty" jsonschema:"Optional display name; a generated UUID is used by default"`
	IsPrivate             *bool          `json:"isPrivate,omitempty" jsonschema:"Whether only the authenticated owner may read the inbox"`
	Response              *ResponseInput `json:"response,omitempty" jsonschema:"Optional capture endpoint response configuration"`
	ObfuscateHeaderFields []string       `json:"obfuscateHeaderFields,omitempty" jsonschema:"Incoming header names whose values should be obfuscated"`
}

type EditInboxInput struct {
	InboxID               string         `json:"inboxId" jsonschema:"Request inbox UUID"`
	Name                  *string        `json:"name,omitempty" jsonschema:"New display name"`
	IsPrivate             *bool          `json:"isPrivate,omitempty" jsonschema:"Whether only the authenticated owner may read the inbox"`
	Response              *ResponseInput `json:"response,omitempty" jsonschema:"Fields to change in the capture endpoint response"`
	ObfuscateHeaderFields *[]string      `json:"obfuscateHeaderFields,omitempty" jsonschema:"Replacement list of incoming header names to obfuscate"`
}

type InboxIDInput struct {
	InboxID string `json:"inboxId" jsonschema:"Request inbox UUID"`
}

type AddCallbackInput struct {
	InboxID        string            `json:"inboxId" jsonschema:"Request inbox UUID"`
	DestinationURL string            `json:"destinationUrl" jsonschema:"HTTP or HTTPS callback destination URL"`
	Method         string            `json:"method,omitempty" jsonschema:"HTTP method or dynamic Go template; defaults to POST"`
	Headers        map[string]string `json:"headers,omitempty" jsonschema:"Callback request headers"`
	Body           string            `json:"body,omitempty" jsonschema:"Callback request body"`
	IsEnabled      *bool             `json:"isEnabled,omitempty" jsonschema:"Whether the callback runs for new requests; defaults to true"`
	IsDynamic      *bool             `json:"isDynamic,omitempty" jsonschema:"Whether callback fields are rendered as Go templates"`
	ForwardHeaders *bool             `json:"forwardHeaders,omitempty" jsonschema:"Whether incoming request headers are forwarded"`
}

type ListRequestsInput struct {
	InboxID        string `json:"inboxId" jsonschema:"Request inbox UUID"`
	RequestLimit   int    `json:"requestLimit,omitempty" jsonschema:"Maximum requests to return, from 1 to 20; defaults to 5"`
	AfterRequestID *int   `json:"afterRequestId,omitempty" jsonschema:"Return only requests with a larger ID for cursor polling"`
}

type ResponseOutput struct {
	Code         int               `json:"code"`
	CodeTemplate string            `json:"codeTemplate"`
	Body         string            `json:"body"`
	Headers      map[string]string `json:"headers"`
	IsDynamic    bool              `json:"isDynamic"`
}

type InboxOutput struct {
	InboxID               string         `json:"inboxId"`
	Name                  string         `json:"name"`
	Timestamp             int64          `json:"timestamp"`
	CaptureURL            string         `json:"captureUrl"`
	DetailURL             string         `json:"detailUrl"`
	IsPrivate             bool           `json:"isPrivate"`
	Response              ResponseOutput `json:"response"`
	ObfuscateHeaderFields []string       `json:"obfuscateHeaderFields"`
	CallbackCount         int            `json:"callbackCount"`
	Warning               string         `json:"warning,omitempty"`
}

type InboxSummary struct {
	InboxID       string `json:"inboxId"`
	Name          string `json:"name"`
	Timestamp     int64  `json:"timestamp"`
	CaptureURL    string `json:"captureUrl"`
	DetailURL     string `json:"detailUrl"`
	IsPrivate     bool   `json:"isPrivate"`
	CallbackCount int    `json:"callbackCount"`
}

type ListInboxesOutput struct {
	Inboxes []InboxSummary `json:"inboxes"`
	Count   int            `json:"count"`
}

type DeleteInboxOutput struct {
	InboxID string `json:"inboxId"`
	Deleted bool   `json:"deleted"`
}

type ClearRequestsOutput struct {
	InboxID string `json:"inboxId"`
	Cleared bool   `json:"cleared"`
}

type CallbackOutput struct {
	DestinationURL string            `json:"destinationUrl"`
	Method         string            `json:"method"`
	Headers        map[string]string `json:"headers"`
	Body           string            `json:"body"`
	IsEnabled      bool              `json:"isEnabled"`
	IsDynamic      bool              `json:"isDynamic"`
	ForwardHeaders bool              `json:"forwardHeaders"`
}

type AddCallbackOutput struct {
	InboxID       string         `json:"inboxId"`
	CallbackIndex int            `json:"callbackIndex"`
	CallbackCount int            `json:"callbackCount"`
	Callback      CallbackOutput `json:"callback"`
}

type RequestOutput struct {
	RequestID     int                 `json:"requestId"`
	Timestamp     int64               `json:"timestamp"`
	Method        string              `json:"method"`
	URI           string              `json:"uri"`
	Headers       map[string][]string `json:"headers"`
	Body          string              `json:"body"`
	Host          string              `json:"host"`
	RemoteAddress string              `json:"remoteAddress"`
	Protocol      string              `json:"protocol"`
	ContentLength int64               `json:"contentLength"`
}

type ListRequestsOutput struct {
	InboxID              string          `json:"inboxId"`
	TotalRequestCount    int             `json:"totalRequestCount"`
	MatchingRequestCount int             `json:"matchingRequestCount"`
	ReturnedCount        int             `json:"returnedCount"`
	HasMore              bool            `json:"hasMore"`
	NextAfterRequestID   int             `json:"nextAfterRequestId"`
	Requests             []RequestOutput `json:"requests"`
}
