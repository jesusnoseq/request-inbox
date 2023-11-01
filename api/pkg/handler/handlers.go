package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

var inboxes []model.Inbox

func ListInbox(c *gin.Context) {
	c.JSON(http.StatusOK, inboxes)
}

func CreateInbox(c *gin.Context) {
	// Parse request body and create a new inbox
	var newInbox model.Inbox
	if err := c.ShouldBindJSON(&newInbox); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newInbox.ID = uuid.New()
	inboxes = append(inboxes, newInbox)

	c.JSON(http.StatusCreated, newInbox)
}

func DeleteInbox(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inbox ID"})
		return
	}

	// Find and delete the inbox with the given ID
	for i, inbox := range inboxes {
		if inbox.ID == id {
			inboxes = append(inboxes[:i], inboxes[i+1:]...)
			c.JSON(http.StatusNoContent, nil)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Inbox not found"})
}

func GetInbox(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inbox ID"})
		return
	}

	// Find and return the inbox with the given ID
	for _, inbox := range inboxes {
		if inbox.ID == id {
			c.JSON(http.StatusOK, inbox)
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Inbox not found"})
}

func InboxRequest(c *gin.Context) {
	// Implement the handling of requests associated with an inbox
	// This endpoint should capture requests and associate them with the inbox.
	// You can store these requests in the corresponding inbox's "Requests" field.
	// Make sure to handle different HTTP methods and paths as needed.

	c.JSON(http.StatusNotImplemented, gin.H{"error": "Not implemented"})
}
