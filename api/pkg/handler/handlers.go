package handler

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/callback"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/database/dberrors"
	"github.com/jesusnoseq/request-inbox/pkg/dynamic_response"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
)

type InboxHandler struct {
	dao database.InboxDAO
	et  event.EventTracker
}

func NewInboxHandler(dao database.InboxDAO, et event.EventTracker) *InboxHandler {
	return &InboxHandler{
		dao: dao,
		et:  et,
	}
}

func (ih *InboxHandler) CreateInbox(c *gin.Context) {
	newInbox := model.NewInbox()
	if err := c.ShouldBindJSON(&newInbox); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox", err, http.StatusBadRequest))
		return
	}

	if valid, err := validation.IsValidInbox(newInbox); !valid {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusBadRequest))
		return
	}

	if !login.IsUserLoggedIn(c) && newInbox.IsPrivate {
		err := fmt.Errorf("you must be logged in to create a private inbox")
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusUnauthorized))
		return
	}
	if login.IsUserLoggedIn(c) {
		user, err := login.GetUser(c)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
			return
		}
		newInbox.OwnerID = user.ID
	}

	if newInbox.IsPrivate && newInbox.OwnerID == uuid.Nil {
		c.AbortWithStatusJSON(model.ErrorResponseMsg("An anonymous inbox can not be private", http.StatusBadRequest))
		return
	}

	inbox, err := ih.dao.CreateInbox(c, newInbox)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	userID := newInbox.OwnerID.String()
	if newInbox.OwnerID == uuid.Nil {
		userID = "anonymous"
	}
	event := event.CreateNewInboxEvent{
		BaseEvent: event.BaseEvent{UserID: userID},
		InboxID:   inbox.ID.String(),
	}
	if err := ih.et.Track(c, event); err != nil {
		instrumentation.LogError(c, err, "Failed to track create inbox event")
	}

	c.JSON(http.StatusCreated, inbox)
}

func (ih *InboxHandler) DeleteInbox(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox ID", err, http.StatusBadRequest))
		return
	}

	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		if errors.Is(err, dberrors.ErrItemNotFound) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
			return
		}
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	err = checkWriteInboxPermissions(c, inbox)
	if err != nil {
		slog.Error("error deleting inbox", "error", err)
		return
	}

	err = ih.dao.DeleteInbox(c, id)
	if err != nil {
		if errors.Is(err, dberrors.ErrItemNotFound) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
			return
		}
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (ih *InboxHandler) DeleteInboxRequests(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox ID", err, http.StatusBadRequest))
		return
	}

	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		if errors.Is(err, dberrors.ErrItemNotFound) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
			return
		}
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	err = checkWriteInboxPermissions(c, inbox)
	if err != nil {
		slog.Error("error deleting requests of inbox", "error", err)
		return
	}

	err = ih.dao.DeleteInboxRequests(c, id)
	if err != nil {
		if errors.Is(err, dberrors.ErrItemNotFound) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
			return
		}
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (ih *InboxHandler) GetInbox(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox ID", err, http.StatusBadRequest))
		return
	}

	inbox, err := ih.dao.GetInboxWithRequests(c, id)
	if err != nil {
		if errors.Is(err, dberrors.ErrItemNotFound) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
			return
		}
		code, errResp := model.ErrorResponseWithError(
			"error getting inbox "+id.String(),
			err,
			http.StatusInternalServerError)
		c.AbortWithStatusJSON(code, errResp)
		return
	}

	err = checkReadInboxPermissions(c, inbox)
	if err != nil {
		slog.Error("error getting inbox", "error", err)
		return
	}

	c.JSON(http.StatusOK, inbox)
}

func (ih *InboxHandler) UpdateInbox(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox ID", err, http.StatusBadRequest))
		return
	}
	var updatedInbox model.Inbox
	if err := c.ShouldBindJSON(&updatedInbox); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("inbox not valid", err, http.StatusBadRequest))
		return
	}

	if valid, err := validation.IsValidInbox(updatedInbox); !valid {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusBadRequest))
		return
	}

	if updatedInbox.IsPrivate && updatedInbox.OwnerID == uuid.Nil {
		c.AbortWithStatusJSON(model.ErrorResponseMsg("An anonymous inbox can not be private", http.StatusBadRequest))
		return
	}

	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		if errors.Is(err, dberrors.ErrItemNotFound) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
			return
		}
		code, errResp := model.ErrorResponseWithError(
			"error getting inbox "+id.String(),
			err,
			http.StatusInternalServerError)
		c.AbortWithStatusJSON(code, errResp)
		return
	}

	err = checkWriteInboxPermissions(c, inbox)
	if err != nil {
		slog.Error("error updating inbox", "error", err)
		return
	}

	updatedInbox.ID = id
	updatedInbox.Timestamp = inbox.Timestamp
	updatedInbox.Requests = inbox.Requests
	updatedInbox, err = ih.dao.UpdateInbox(c, updatedInbox)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, updatedInbox)
}

func (ih *InboxHandler) ListInbox(c *gin.Context) {
	if login.IsUserLoggedIn(c) {
		user, err := login.GetUser(c)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
			return
		}
		inboxes, err := ih.dao.ListInboxByUser(c, user.ID)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
			return
		}
		c.JSON(http.StatusOK, model.NewItemList(inboxes))
		return
	}

	if !config.GetBool(config.EnableListingPublicInbox) {
		c.JSON(http.StatusOK, model.NewItemList([]model.Inbox{}))
		return
	}

	inboxes, err := ih.dao.ListInbox(c)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, model.NewItemList(inboxes))
}

func (ih *InboxHandler) RegisterInboxRequest(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox ID", err, http.StatusBadRequest))
		return
	}

	inbox, err := ih.dao.GetInboxWithRequests(c, id)
	if err != nil {
		if errors.Is(err, dberrors.ErrItemNotFound) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
			return
		}
		code, errResp := model.ErrorResponseWithError(
			"error getting inbox "+id.String(),
			err,
			http.StatusInternalServerError)
		c.AbortWithStatusJSON(code, errResp)
		return
	}

	body, err := c.GetRawData()
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
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
	filterRequestData(&request)

	// TODO
	// handle response return
	// add extra functions to templates
	// handle dynamic templates for callbacks
	// save callbacks responses
	// test callbacks
	callbackResponses := callback.SendCallbacks(inbox, request)
	request.CallbackResponses = callbackResponses
	err = ih.dao.AddRequestToInbox(c, id, request)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}
	if inbox.Response.Code == 0 {
		return
	}

	if inbox.Response.IsDynamic {
		inbox, err = dynamic_response.ParseInbox(c, inbox, request)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
			return
		}
	}

	err = c.ShouldBindHeader(inbox.Response.Headers)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}
	contentType := ""
	for k, v := range inbox.Response.Headers {
		if k == model.ContentTypeHeader {
			contentType = v
		}
		c.Header(k, v)
	}
	c.Data(inbox.Response.Code, contentType, []byte(inbox.Response.Body))
}

func filterRequestData(req *model.Request) {
	cookies := req.Headers["Cookie"]
	if len(cookies) == 0 {
		return
	}
	cookieSeparator := "; "
	cs := strings.Split(cookies[0], cookieSeparator)
	fc := []string{}
	for _, c := range cs {
		if strings.HasPrefix(c, login.AuthTokenCookieName+"=") || strings.HasPrefix(c, login.OauthStateCookieName+"=") {
			continue
		}
		fc = append(fc, c)
	}
	cookies[0] = strings.Join(fc, cookieSeparator)
}
