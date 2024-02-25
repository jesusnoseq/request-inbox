package route

import (
	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
)

func SetInboxRoutes(r gin.IRouter, ih handler.IInboxHandler) {
	v1 := r.Group("/api/v1")
	{
		v1.GET("/health", ih.Health)
		inboxes := v1.Group("/inboxes")
		{
			inboxes.GET("", ih.ListInbox)
			inboxes.POST("", ih.CreateInbox)
			inboxes.DELETE("/:id", ih.DeleteInbox)
			inboxes.GET("/:id", ih.GetInbox)
			inboxes.PUT("/:id", ih.UpdateInbox)
			inboxes.DELETE("/:id/requests", ih.DeleteInboxRequests)
			inboxes.Any("/:id/in", ih.RegisterInboxRequest)
			inboxes.Any("/:id/in/*path", ih.RegisterInboxRequest)
		}
	}

}
