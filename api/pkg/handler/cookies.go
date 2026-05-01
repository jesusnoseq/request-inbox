package handler

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

type utilityHandler struct{}

func NewUtilityHandler() UtilityHandler {
	return &utilityHandler{}
}

func (u *utilityHandler) AcceptCookies(c *gin.Context) {
	slog.Info("Cookies accepted", "ip", c.ClientIP())
	c.JSON(http.StatusNoContent, gin.H{})
}
