package route

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/mcpserver"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func SetMCPRoute(r gin.IRouter, server http.Handler) {
	r.Any("/mcp", func(c *gin.Context) {
		var user *model.User
		if login.IsUserLoggedIn(c) {
			loggedInUser, err := login.GetUser(c)
			if err != nil {
				c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusInternalServerError))
				return
			}
			user = &loggedInUser
		}

		scheme := "http"
		if c.Request.TLS != nil {
			scheme = "https"
		}
		if forwardedProto := c.GetHeader("X-Forwarded-Proto"); forwardedProto != "" {
			scheme = strings.TrimSpace(strings.Split(forwardedProto, ",")[0])
		}
		ctx := mcpserver.WithRequestContext(c.Request.Context(), user, scheme+"://"+c.Request.Host)
		server.ServeHTTP(c.Writer, c.Request.WithContext(ctx))
	})
}
