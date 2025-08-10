package instrumentation

import (
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/collection"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func MonitoringMiddleware(et EventTracker) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		c.Next()
		included_methods := config.GetStringSlice(config.MonitoringTrackedMethods)
		if !collection.SliceContains(included_methods, c.Request.Method) {
			return
		}
		go func() {
			event := APIRequestEvent{
				Method:     c.Request.Method,
				Endpoint:   c.FullPath(),
				StatusCode: c.Writer.Status(),
				BaseEvent:  BaseEvent{UserID: userID},
			}
			err := et.Track(c, event)
			if err != nil {
				slog.Error("Failed to track API request", "error", err)
			}
		}()
	}
}

func getUserIDFromContext(c *gin.Context) string {
	if user, exists := c.Get("user"); exists {
		if user, ok := user.(model.User); ok {
			return user.ID.String()
		}
	}

	return "anonymous"
}
