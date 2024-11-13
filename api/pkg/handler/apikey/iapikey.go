package apikey

import "github.com/gin-gonic/gin"

//go:generate mockgen -destination=apikey_mock/apikey_mock.go -package=apikey_mock github.com/jesusnoseq/request-inbox/pkg/handler/apikey IAPIKeyHandler

type IAPIKeyHandler interface {
	CreateAPIKey(c *gin.Context)
	GetAPIKey(c *gin.Context)
	ListAPIKeysByUser(c *gin.Context)
	DeleteAPIKey(c *gin.Context)
}
