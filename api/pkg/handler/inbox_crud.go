package handler

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation/event"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
)

func (ih *inboxHandler) CreateInbox(c *gin.Context) {
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

	ih.trackCreateInboxEvent(c, inbox)

	c.JSON(http.StatusCreated, inbox)
}

func (ih *inboxHandler) trackCreateInboxEvent(c *gin.Context, inbox model.Inbox) {
	userID := "anonymous"
	if inbox.OwnerID != uuid.Nil {
		userID = inbox.OwnerID.String()
	}
	evt := event.CreateNewInboxEvent{
		BaseEvent: event.BaseEvent{UserID: userID},
		InboxID:   inbox.ID.String(),
	}
	if err := ih.et.Track(c, evt); err != nil {
		instrumentation.LogError(c, err, "Failed to track create inbox event")
	}
}

func (ih *inboxHandler) DeleteInbox(c *gin.Context) {
	id, ok := parseInboxID(c)
	if !ok {
		return
	}

	inbox, ok := ih.fetchInbox(c, id)
	if !ok {
		return
	}

	if err := checkWriteInboxPermissions(c, inbox); err != nil {
		slog.Error("error deleting inbox", "error", err)
		return
	}

	if err := ih.dao.DeleteInbox(c, id); err != nil {
		abortWithDBError(c, "error deleting inbox "+id.String(), err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (ih *inboxHandler) DeleteInboxRequests(c *gin.Context) {
	id, ok := parseInboxID(c)
	if !ok {
		return
	}

	inbox, ok := ih.fetchInbox(c, id)
	if !ok {
		return
	}

	if err := checkWriteInboxPermissions(c, inbox); err != nil {
		slog.Error("error deleting requests of inbox", "error", err)
		return
	}

	if err := ih.dao.DeleteInboxRequests(c, id); err != nil {
		abortWithDBError(c, "error deleting requests of inbox "+id.String(), err)
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

func (ih *inboxHandler) GetInbox(c *gin.Context) {
	id, ok := parseInboxID(c)
	if !ok {
		return
	}

	inbox, ok := ih.fetchInboxWithRequests(c, id)
	if !ok {
		return
	}

	if err := checkReadInboxPermissions(c, inbox); err != nil {
		slog.Error("error getting inbox", "error", err)
		return
	}

	c.JSON(http.StatusOK, inbox)
}

func (ih *inboxHandler) UpdateInbox(c *gin.Context) {
	id, ok := parseInboxID(c)
	if !ok {
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

	inbox, ok := ih.fetchInbox(c, id)
	if !ok {
		return
	}

	if err := checkWriteInboxPermissions(c, inbox); err != nil {
		slog.Error("error updating inbox", "error", err)
		return
	}

	updatedInbox.ID = id
	updatedInbox.Timestamp = inbox.Timestamp
	updatedInbox.Requests = inbox.Requests
	updatedInbox, err := ih.dao.UpdateInbox(c, updatedInbox)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, updatedInbox)
}

func (ih *inboxHandler) ListInbox(c *gin.Context) {
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
