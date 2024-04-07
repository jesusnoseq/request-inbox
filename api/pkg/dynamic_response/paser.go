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

func ParseInbox(c context.Context, inbox model.Inbox, req model.Request) (model.Inbox, error) {
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

	for k, v := range inCopy.Response.Headers {
		parsedVal, err := parse(v, values)
		if err != nil {
			return inCopy, fmt.Errorf("header %s template error: %w", k, err)
		}
		inCopy.Response.Headers[k] = parsedVal
	}

	return inCopy, nil
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
