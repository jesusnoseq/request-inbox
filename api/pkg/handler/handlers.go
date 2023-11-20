package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type InboxHandler struct {
	dao database.InboxDAO
}

func NewInboxHandler(dao database.InboxDAO) *InboxHandler {
	return &InboxHandler{
		dao: dao,
	}
}

func (ih *InboxHandler) CreateInbox(c *gin.Context) {
	newInbox := model.NewInbox()
	if err := c.ShouldBindJSON(&newInbox); err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox", err, http.StatusBadRequest))
		return
	}
	inbox, err := ih.dao.CreateInbox(c, newInbox)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusCreated, inbox)
}

func (ih *InboxHandler) DeleteInbox(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("invalid inbox ID", err, http.StatusBadRequest))
		return
	}
	err = ih.dao.DeleteInbox(c, id)
	if err != nil {
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
	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("inbox not found", err, http.StatusNotFound))
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
		c.AbortWithStatusJSON(model.ErrorResponseWithError("inbox not found", err, http.StatusNotFound))
		return
	}

	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("inbox not found", err, http.StatusNotFound))
		return
	}
	updatedInbox.ID = id
	updatedInbox.Timestamp = inbox.Timestamp
	updatedInbox, err = ih.dao.UpdateInbox(c, updatedInbox)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}

	c.JSON(http.StatusOK, updatedInbox)
}

func (ih *InboxHandler) ListInbox(c *gin.Context) {
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
	path := c.Param("path")

	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("inbox not found", err, http.StatusNotFound))
		return
	}

	body, err := c.GetRawData()
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}
	request := model.Request{
		ID:        len(inbox.Requests),
		Timestamp: time.Now().UnixMilli(),
		Path:      path,
		Headers:   c.Request.Header,
		Body:      string(body),
	}
	inbox.Requests = append(inbox.Requests, request)
	_, err = ih.dao.UpdateInbox(c, inbox)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}
	if inbox.Response.Code == 0 {
		return
	}
	err = c.ShouldBindHeader(inbox.Response.Headers)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
		return
	}
	c.JSON(inbox.Response.Code, inbox.Response.Body)
}
