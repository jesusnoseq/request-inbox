package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/callback"
	"github.com/jesusnoseq/request-inbox/pkg/dynamic_response"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func (ih *inboxHandler) RegisterInboxRequest(c *gin.Context) {
	id, ok := parseInboxID(c)
	if !ok {
		return
	}

	inbox, ok := ih.fetchInboxWithRequests(c, id)
	if !ok {
		return
	}

	request, err := buildCapturedRequest(c, inbox)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	request.CallbackResponses = callback.SendCallbacks(c, inbox, request)
	if err := ih.dao.AddRequestToInbox(c, id, request); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	if inbox.Response.Code == 0 {
		return
	}

	if inbox.Response.IsDynamic {
		inbox, err = dynamic_response.ParseInboxResponse(c, inbox, request)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
			return
		}
	}

	writeConfiguredResponse(c, inbox.Response)
}

func buildCapturedRequest(c *gin.Context, inbox model.Inbox) (model.Request, error) {
	body, err := c.GetRawData()
	if err != nil {
		return model.Request{}, err
	}

	request := model.Request{
		ID:            len(inbox.Requests),
		Timestamp:     time.Now().UnixMilli(),
		URI:           c.Request.RequestURI,
		Headers:       c.Request.Header,
		Method:        c.Request.Method,
		Host:          c.Request.Host,
		RemoteAddr:    c.Request.RemoteAddr,
		Protocol:      c.Request.Proto,
		ContentLength: c.Request.ContentLength,
		Body:          string(body),
	}
	stripAuthCookies(&request)

	return request, nil
}

func stripAuthCookies(req *model.Request) {
	cookies := req.Headers["Cookie"]
	if len(cookies) == 0 {
		return
	}
	const cookieSeparator = "; "
	parts := strings.Split(cookies[0], cookieSeparator)
	kept := make([]string, 0, len(parts))
	for _, part := range parts {
		if strings.HasPrefix(part, login.AuthTokenCookieName+"=") || strings.HasPrefix(part, login.OauthStateCookieName+"=") {
			continue
		}
		kept = append(kept, part)
	}
	cookies[0] = strings.Join(kept, cookieSeparator)
}

func writeConfiguredResponse(c *gin.Context, resp model.Response) {
	if err := c.ShouldBindHeader(resp.Headers); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	contentType := ""
	for k, v := range resp.Headers {
		if k == model.ContentTypeHeader {
			contentType = v
		}
		c.Header(k, v)
	}
	c.Data(resp.Code, contentType, []byte(resp.Body))
}
