package handler

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (ih *InboxHandler) AcceptCookies(c *gin.Context) {
	slog.Info("Cookies accepted", "ip", c.ClientIP())
	c.JSON(http.StatusNoContent, gin.H{})
}
