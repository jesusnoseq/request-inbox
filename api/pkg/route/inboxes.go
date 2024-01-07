package route

import (
	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
)

func SetInboxRoutes(r gin.IRouter, ih handler.IInboxHandler) {
	// Define the routes and their handlers
	v1 := r.Group("/api/v1")
	{
		inboxes := v1.Group("/inboxes")
		{
			inboxes.GET("", ih.ListInbox)
			inboxes.POST("", ih.CreateInbox)
			inboxes.DELETE("/:id", ih.DeleteInbox)
			inboxes.GET("/:id", ih.GetInbox)
			inboxes.PUT("/:id", ih.UpdateInbox)
			inboxes.Any("/:id/in", ih.RegisterInboxRequest)
			inboxes.Any("/:id/in/*path", ih.RegisterInboxRequest)
			inboxes.GET("/health", ih.Health)
		}
	}

}
