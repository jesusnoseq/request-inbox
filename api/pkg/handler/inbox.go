package handler

import "github.com/gin-gonic/gin"

//go:generate mockgen -destination=handler_mock/inbox_mock.go -package=handler_mock github.com/jesusnoseq/request-inbox/pkg/handler InboxService,HealthHandler,UtilityHandler

type InboxService interface {
	CreateInbox(c *gin.Context)
	DeleteInbox(c *gin.Context)
	GetInbox(c *gin.Context)
	UpdateInbox(c *gin.Context)
	ListInbox(c *gin.Context)
	DeleteInboxRequests(c *gin.Context)
	RegisterInboxRequest(c *gin.Context)
}

type HealthHandler interface {
	Health(c *gin.Context)
}

type UtilityHandler interface {
	AcceptCookies(c *gin.Context)
}
