package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
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
		c.AbortWithStatusJSON(model.ErrorResponseWithError("inbox not valid", err, http.StatusBadRequest))
		return
	}

	inbox, err := ih.dao.GetInbox(c, id)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseWithError("inbox not found", err, http.StatusNotFound))
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
	if !config.GetBool(config.EnableListingInbox) {
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
	err = ih.dao.AddRequestToInbox(c, id, request)
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
	contentType := ""
	for k, v := range inbox.Response.Headers {
		if k == model.ContentTypeHeader {
			contentType = v
		}
		c.Header(k, v)
	}
	c.Data(inbox.Response.Code, contentType, []byte(inbox.Response.Body))
}
