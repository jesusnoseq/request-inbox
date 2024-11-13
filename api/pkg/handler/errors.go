package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

const (
	notFoundMessage         = "resource not found"
	methodNotAllowedMessage = "method not allowed"
	notAllowedMessage       = "not allowed"
)

func MethodNotAllowedHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusMethodNotAllowed,
		model.ErrorResponse{
			Code:    http.StatusMethodNotAllowed,
			Message: methodNotAllowedMessage,
		})
}

func NotFoundHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusNotFound,
		model.ErrorResponse{
			Code:    http.StatusNotFound,
			Message: notFoundMessage,
		})
}
