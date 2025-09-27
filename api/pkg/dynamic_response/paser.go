package dynamic_response

import (
	"bytes"
	"context"
	"fmt"
	"strconv"
	"strings"
	"text/template"

	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
)

var templateFuncMap = template.FuncMap{
	"toUpper":                 strings.ToUpper,
	"toLower":                 strings.ToLower,
	"join":                    strings.Join,
	"split":                   strings.Split,
	"trimSpace":               strings.TrimSpace,
	"gjsonPath":               gjsonPath,
	"gjsonPathOrDefault":      gjsonPathOrDefault,
	"currentTimestampSeconds": currentTimestampSeconds,
	"now":                     now,
	"today":                   today,
	"randomString":            randomString,
	"randomInt":               randomInt,
	"randomFloat":             randomFloat,
	"randomBool":              randomBool,
	"randomUUID":              randomUUID,
	"intAdd":                  intAdd,
	"intSubtract":             intSubtract,
	"stringToInt":             stringToInt,
}

func ParseInboxResponse(c context.Context, inbox model.Inbox, req model.Request) (model.Inbox, error) {
	inCopy := model.CopyInbox(inbox)
	values := map[string]any{
		"Request": req,
		"Inbox":   &inCopy,
	}

	if inbox.Response.CodeTemplate != "" {
		statusCodeRender, err := parse(inCopy.Response.CodeTemplate, values)
		if err != nil {
			return inCopy, fmt.Errorf("status code template error: %w", err)
		}
		newCode, err := strconv.Atoi(statusCodeRender)
		isValid, _ := validation.IsHTTPStatusCode(newCode)
		if err == nil && isValid {
			inCopy.Response.Code = newCode
		}
	}

	body, err := parse(inCopy.Response.Body, values)
	if err != nil {
		return inCopy, fmt.Errorf("body template error: %w", err)
	}
	inCopy.Response.Body = body

	parsedHeaders, err := parseHeaders(inCopy.Response.Headers, values)
	if err != nil {
		return inCopy, fmt.Errorf("response %w", err)
	}
	inCopy.Response.Headers = parsedHeaders

	return inCopy, nil
}

func ParseCallback(c context.Context, index int, inbox model.Inbox, req model.Request) (model.Callback, error) {
	if index >= len(inbox.Callbacks) {
		return model.Callback{}, fmt.Errorf("callback index %d out of bounds", index)
	}

	cb := inbox.Callbacks[index]

	if !cb.IsDynamic {
		return cb, nil // Non-dynamic callbacks are kept as-is
	}

	values := map[string]any{
		"Request": req,
		"Inbox":   &inbox,
		"Index":   index,
	}
	parsedURL, err := parse(cb.ToURL, values)
	if err != nil {
		return model.Callback{}, fmt.Errorf("callback %d URL template error: %w", index, err)
	}
	parsedMethod, err := parse(cb.Method, values)
	if err != nil {
		return model.Callback{}, fmt.Errorf("callback %d Method template error: %w", index, err)
	}
	parsedBody, err := parse(cb.Body, values)
	if err != nil {
		return model.Callback{}, fmt.Errorf("callback %d Body template error: %w", index, err)
	}
	parsedHeaders, err := parseHeaders(cb.Headers, values)
	if err != nil {
		return model.Callback{}, fmt.Errorf("callback %d %w", index, err)
	}

	return model.Callback{
		IsEnabled: cb.IsEnabled,
		IsDynamic: cb.IsDynamic,
		ToURL:     parsedURL,
		Method:    parsedMethod,
		Headers:   parsedHeaders,
		Body:      parsedBody,
	}, nil
}

func parseHeaders(headers map[string]string, values map[string]any) (map[string]string, error) {
	parsedHeaders := make(map[string]string)
	for k, v := range headers {
		parsedVal, err := parse(v, values)
		if err != nil {
			return nil, fmt.Errorf("header %s template error: %w", k, err)
		}
		parsedHeaders[k] = parsedVal
	}
	return parsedHeaders, nil
}

func parse(content string, values map[string]any) (string, error) {
	templ, err := template.New("").Funcs(templateFuncMap).Parse(content)

	if err != nil {
		return content, fmt.Errorf("template is not valid: %w", err)
	}
	output := &bytes.Buffer{}
	err = templ.ExecuteTemplate(output, "", values)
	if err != nil {
		return content, fmt.Errorf("template execution is not valid: %w", err)
	}
	return output.String(), nil
}
