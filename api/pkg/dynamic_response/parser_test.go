package dynamic_response_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/jesusnoseq/request-inbox/pkg/dynamic_response"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func TestParse(t *testing.T) {
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
