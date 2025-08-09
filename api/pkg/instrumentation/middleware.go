package instrumentation

import (
	"log/slog"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func MonitoringMiddleware(et EventTracker) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		c.Next()
		go func() {
			event := APIRequestEvent{
				Method:     c.Request.Method,
				Endpoint:   c.FullPath(),
				StatusCode: c.Writer.Status(),
				BaseEvent:  BaseEvent{UserID: userID},
			}
			if err := et.Track(c, event); err != nil {
				slog.Error("failed to track request", slog.Any("event", event), slog.Any("error", err))
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
