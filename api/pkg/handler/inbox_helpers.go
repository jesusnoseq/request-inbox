package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database/dberrors"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func parseInboxID(c *gin.Context) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox ID", err, http.StatusBadRequest))
		return uuid.UUID{}, false
	}
	return id, true
}

func abortWithDBError(c *gin.Context, action string, err error) {
	if errors.Is(err, dberrors.ErrItemNotFound) {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusNotFound))
		return
	}
	c.AbortWithStatusJSON(model.ErrorResponseWithError(action, err, http.StatusInternalServerError))
}

func (ih *inboxHandler) fetchInbox(c *gin.Context, id uuid.UUID) (model.Inbox, bool) {
	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		abortWithDBError(c, "error getting inbox "+id.String(), err)
		return model.Inbox{}, false
	}
	return inbox, true
}

func (ih *inboxHandler) fetchInboxWithRequests(c *gin.Context, id uuid.UUID) (model.Inbox, bool) {
	inbox, err := ih.dao.GetInboxWithRequests(c, id)
	if err != nil {
		abortWithDBError(c, "error getting inbox "+id.String(), err)
		return model.Inbox{}, false
	}
	return inbox, true
}
