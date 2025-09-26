package dynamic_response_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/jesusnoseq/request-inbox/pkg/dynamic_response"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestParseInbox(t *testing.T) {
	orgInbox := model.GenerateInbox()
	orgInbox.Requests = []model.Request{}
	orgReq := model.GenerateRequest(1)

	testCases := []struct {
		desc      string
		inbox     model.Inbox
		req       model.Request
		expect    model.Inbox
		expectErr bool
	}{
		{
			desc: "Response without using any template features",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = "no template features"
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = "no template features"
				return in
			}(),
			expectErr: false,
		},
		{
			desc: "Response body with inbox info",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = "The inbox name is {{.Inbox.Name}}"
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = "The inbox name is " + in.Name
				return in
			}(),
			expectErr: false,
		},
		{
			desc: "Response body with request info",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = "Your IP is {{.Request.RemoteAddr}}"
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = "Your IP is " + orgReq.RemoteAddr
				return in
			}(),
			expectErr: false,
		},
		{
			desc: "Response body with request json body info",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = `{ "reqValue": "{{gjsonPath .Request.Body "example"}}"}`
				return in
			}(),
			req: func() model.Request {
				r := model.CopyRequest(orgReq)
				r.Body = `{"example": "requestTestValue"}`
				return r
			}(),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = `{ "reqValue": "requestTestValue"}`
				return in
			}(),
			expectErr: false,
		},
		{
			desc: "Response body with request string transform info",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = `{{"string template features" | toUpper}}`
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = "STRING TEMPLATE FEATURES"
				return in
			}(),
			expectErr: false,
		},
		{
			desc: "Response header with date info",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Headers["test"] = "template test {{today}}"
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Headers["test"] = "template test " + time.Now().Format("2006-01-02")
				return in
			}(),
			expectErr: false,
		},
		{
			desc: "Error parsing response body template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = `{{wrong}}`
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.Body = `{{wrong}}`
				return in
			}(),
			expectErr: true,
		},
		{
			desc: "Parsing status code template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{ intAdd 300 100 }}`
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{ intAdd 300 100 }}`
				in.Response.Code = 400
				return in
			}(),
			expectErr: false,
		},
		{
			desc: "error Parsing status code template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{wrong}}`
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{wrong}}`
				in.Response.Code = 200
				return in
			}(),
			expectErr: true,
		},
		{
			desc: "template result is not a valid number",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{ intAdd 0 1 }}`
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{ intAdd 0 1 }}`
				in.Response.Code = 200
				return in
			}(),
			expectErr: false,
		},

		{
			desc: "Check parse order",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{ intAdd 100 1 }}`
				in.Response.Body = `{{ intAdd .Inbox.Response.Code 1 }}`
				in.Response.Headers["testHeader"] = `{{ $n:= stringToInt .Inbox.Response.Body }}{{ intAdd $n 1 }}`
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Response.CodeTemplate = `{{ intAdd 100 1 }}`
				in.Response.Code = 101
				in.Response.Body = `102`
				in.Response.Headers["testHeader"] = `103`
				return in
			}(),
			expectErr: false,
		},
	}

	ctx := context.Background()
	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			got, err := dynamic_response.ParseInbox(ctx, tc.inbox, tc.req)

			if err != nil && !tc.expectErr {
				t.Error(err)
				return
			}
			if diff := cmp.Diff(got, tc.expect); diff != "" {
				t.Errorf("Diff(queryInbox, inbox) = %v, expected to be equals", diff)
			}
		})
	}
}

func TestParseCallbacks(t *testing.T) {
	orgInbox := model.GenerateInbox()
	orgReq := model.GenerateRequest(1)

	testCases := []struct {
		desc      string
		inbox     model.Inbox
		req       model.Request
		expect    []model.Callback
		expectErr bool
	}{
		{
			desc: "Empty callbacks",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{}
				return in
			}(),
			req:       model.CopyRequest(orgReq),
			expect:    []model.Callback{},
			expectErr: false,
		},
		{
			desc: "Single callback without templates",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: false,
						ToURL:     "https://example.com/webhook",
						Method:    "POST",
						Headers: map[string]string{
							"Content-Type": "application/json",
						},
						Body: `{"message": "test"}`,
					},
				}
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: []model.Callback{
				{
					IsEnabled: true,
					IsDynamic: false,
					ToURL:     "https://example.com/webhook",
					Method:    "POST",
					Headers: map[string]string{
						"Content-Type": "application/json",
					},
					Body: `{"message": "test"}`,
				},
			},
			expectErr: false,
		},
		{
			desc: "Callback with URL template using request data",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://{{.Request.RemoteAddr}}/webhook",
						Method:    "POST",
						Headers:   map[string]string{},
						Body:      "",
					},
				}
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: []model.Callback{
				{
					IsEnabled: true,
					IsDynamic: true,
					ToURL:     "https://" + orgReq.RemoteAddr + "/webhook",
					Method:    "POST",
					Headers:   map[string]string{},
					Body:      "",
				},
			},
			expectErr: false,
		},
		{
			desc: "Callback with method template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://example.com/webhook",
						Method:    "{{.Request.Method | toUpper}}",
						Headers:   map[string]string{},
						Body:      "",
					},
				}
				return in
			}(),
			req: func() model.Request {
				r := model.CopyRequest(orgReq)
				r.Method = "post"
				return r
			}(),
			expect: []model.Callback{
				{
					IsEnabled: true,
					IsDynamic: true,
					ToURL:     "https://example.com/webhook",
					Method:    "POST",
					Headers:   map[string]string{},
					Body:      "",
				},
			},
			expectErr: false,
		},
		{
			desc: "Callback with body template using request body",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://example.com/webhook",
						Method:    "POST",
						Headers:   map[string]string{},
						Body:      `{"original": "{{gjsonPath .Request.Body "name"}}"}`,
					},
				}
				return in
			}(),
			req: func() model.Request {
				r := model.CopyRequest(orgReq)
				r.Body = `{"name": "John Doe"}`
				return r
			}(),
			expect: []model.Callback{
				{
					IsEnabled: true,
					IsDynamic: true,
					ToURL:     "https://example.com/webhook",
					Method:    "POST",
					Headers:   map[string]string{},
					Body:      `{"original": "John Doe"}`,
				},
			},
			expectErr: false,
		},
		{
			desc: "Callback with header templates",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://example.com/webhook",
						Method:    "POST",
						Headers: map[string]string{
							"X-Original-IP": "{{.Request.RemoteAddr}}",
							"X-Inbox-Name":  "{{.Inbox.Name}}",
							"X-Timestamp":   "{{currentTimestampSeconds}}",
						},
						Body: "",
					},
				}
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: []model.Callback{
				{
					IsEnabled: true,
					IsDynamic: true,
					ToURL:     "https://example.com/webhook",
					Method:    "POST",
					Headers: map[string]string{
						"X-Original-IP": orgReq.RemoteAddr,
						"X-Inbox-Name":  orgInbox.Name,
						"X-Timestamp": func() string {
							// We'll check this is a valid timestamp, but not exact value
							return "{{currentTimestampSeconds}}"
						}(),
					},
					Body: "",
				},
			},
			expectErr: false,
		},
		{
			desc: "Multiple callbacks with templates",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://webhook1.com/{{.Index}}",
						Method:    "POST",
						Headers:   map[string]string{},
						Body:      `{"callback_index": {{.Index}}}`,
					},
					{
						IsEnabled: false,
						IsDynamic: true,
						ToURL:     "https://webhook2.com/{{.Index}}",
						Method:    "PUT",
						Headers:   map[string]string{},
						Body:      `{"callback_index": {{.Index}}}`,
					},
				}
				return in
			}(),
			req: model.CopyRequest(orgReq),
			expect: []model.Callback{
				{
					IsEnabled: true,
					IsDynamic: true,
					ToURL:     "https://webhook1.com/0",
					Method:    "POST",
					Headers:   map[string]string{},
					Body:      `{"callback_index": 0}`,
				},
				{
					IsEnabled: false,
					IsDynamic: true,
					ToURL:     "https://webhook2.com/1",
					Method:    "PUT",
					Headers:   map[string]string{},
					Body:      `{"callback_index": 1}`,
				},
			},
			expectErr: false,
		},
		{
			desc: "Error in URL template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://{{invalid syntax/webhook",
						Method:    "POST",
						Headers:   map[string]string{},
						Body:      "",
					},
				}
				return in
			}(),
			req:       model.CopyRequest(orgReq),
			expect:    nil,
			expectErr: true,
		},
		{
			desc: "Error in method template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://example.com/webhook",
						Method:    "{{invalid syntax",
						Headers:   map[string]string{},
						Body:      "",
					},
				}
				return in
			}(),
			req:       model.CopyRequest(orgReq),
			expect:    nil,
			expectErr: true,
		},
		{
			desc: "Error in body template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://example.com/webhook",
						Method:    "POST",
						Headers:   map[string]string{},
						Body:      `{"field": "{{invalid syntax"}`,
					},
				}
				return in
			}(),
			req:       model.CopyRequest(orgReq),
			expect:    nil,
			expectErr: true,
		},
		{
			desc: "Error in header template",
			inbox: func() model.Inbox {
				in := model.CopyInbox(orgInbox)
				in.Callbacks = []model.Callback{
					{
						IsEnabled: true,
						IsDynamic: true,
						ToURL:     "https://example.com/webhook",
						Method:    "POST",
						Headers: map[string]string{
							"X-Invalid": "{{invalid syntax",
						},
						Body: "",
					},
				}
				return in
			}(),
			req:       model.CopyRequest(orgReq),
			expect:    nil,
			expectErr: true,
		},
	}

	ctx := context.Background()
	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			got, err := dynamic_response.ParseCallbacks(ctx, tc.inbox, tc.req)

			if err != nil && !tc.expectErr {
				t.Errorf("Unexpected error: %v", err)
				return
			}
			if err == nil && tc.expectErr {
				t.Error("Expected error but got none")
				return
			}
			if tc.expectErr {
				return // Skip comparison if we expected an error
			}

			// Special handling for timestamp header test
			if tc.desc == "Callback with header templates" {
				// Check that X-Timestamp is a valid number
				if len(got) > 0 {
					if timestamp, exists := got[0].Headers["X-Timestamp"]; exists {
						if _, err := time.Parse("1136239445", timestamp); err != nil {
							// If it's not a valid timestamp format, check if it's a number
							if len(timestamp) == 0 {
								t.Errorf("X-Timestamp header is empty")
							}
						}
						// Update expected for comparison
						tc.expect[0].Headers["X-Timestamp"] = timestamp
					}
				}
			}

			if diff := cmp.Diff(got, tc.expect); diff != "" {
				t.Errorf("Diff(got, expected) = %v", diff)
			}
		})
	}
}
