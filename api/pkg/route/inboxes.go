package route

import (
	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
	"github.com/jesusnoseq/request-inbox/pkg/login"
)

const APIBasePath = "/api/v1"

func SetUtilityRoutes(r gin.IRouter, ih handler.IInboxHandler) {
	v1 := r.Group(APIBasePath)
	{
		v1.GET("/health", ih.Health)
	}
}

func SetInboxRoutes(r gin.IRouter, ih handler.IInboxHandler) {
	v1 := r.Group(APIBasePath)
	{
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

func SetLoginRoutes(r gin.IRouter, lh login.ILoginHandler) {
	v1 := r.Group(APIBasePath)
	{
		auth := v1.Group("/auth")
		{
			auth.GET("/:provider/login", lh.HandleLogin)
			auth.GET("/user", lh.HandleLoginUser)
			auth.GET("/logout", lh.HandleLogout)
			auth.GET("/:provider/callback", lh.HandleCallback)
		}
	}
}
