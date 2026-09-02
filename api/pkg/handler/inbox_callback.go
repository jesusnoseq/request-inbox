package handler

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/callback"
	"github.com/jesusnoseq/request-inbox/pkg/dynamic_response"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
)

func (ih *inboxHandler) RetryInboxRequestCallback(c *gin.Context) {
	id, ok := parseInboxID(c)
	if !ok {
		return
	}

	requestID, ok := parseIntParam(c, "requestID")
	if !ok {
		return
	}

	callbackIndex, ok := parseIntParam(c, "callbackIndex")
	if !ok {
		return
	}

	inbox, ok := ih.fetchInboxWithRequests(c, id)
	if !ok {
		return
	}

	if err := checkReadInboxPermissions(c, inbox); err != nil {
		slog.Error("error retrying callback", "error", err)
		return
	}

	request, found := findInboxRequest(inbox, requestID)
	if !found {
		msg := fmt.Sprintf("request %d not found in inbox %s", requestID, id)
		c.AbortWithStatusJSON(model.ErrorResponseMsg(msg, http.StatusNotFound))
		return
	}

	if callbackIndex < 0 || callbackIndex >= len(inbox.Callbacks) {
		msg := fmt.Sprintf("callback %d not found in inbox %s", callbackIndex, id)
		c.AbortWithStatusJSON(model.ErrorResponseMsg(msg, http.StatusNotFound))
		return
	}

	cb, err := dynamic_response.ParseCallback(c, callbackIndex, inbox, request)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("error parsing callback", err, http.StatusBadRequest))
		return
	}

	if !cb.IsEnabled {
		c.AbortWithStatusJSON(model.ErrorResponseMsg("callback is disabled", http.StatusBadRequest))
		return
	}

	if valid, err := validation.IsValidCallbackURL(cb.ToURL); !valid {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid callback URL", err, http.StatusBadRequest))
		return
	}

	cbResp := callback.SendCallback(inbox, callbackIndex, cb, request)
	slog.Info("callback retry response received",
		"inbox_id", inbox.ID,
		"request_id", requestID,
		"callback_index", callbackIndex,
		"url", cbResp.URL,
		"method", cbResp.Method,
		"status_code", cbResp.Code,
		"error", cbResp.Error)

	c.JSON(http.StatusOK, cbResp)
}

func findInboxRequest(inbox model.Inbox, requestID int) (model.Request, bool) {
	for _, req := range inbox.Requests {
		if req.ID == requestID {
			return req, true
		}
	}
	return model.Request{}, false
}
