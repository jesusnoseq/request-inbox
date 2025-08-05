package route

import (
	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
	"github.com/jesusnoseq/request-inbox/pkg/handler/apikey"
	"github.com/jesusnoseq/request-inbox/pkg/login"
)

const APIBasePath = "/api/v1"

func SetUtilityRoutes(r gin.IRouter, ih handler.IInboxHandler) {
	v1 := r.Group(APIBasePath)
	{
		v1.GET("/health", ih.Health)
		v1.GET("/cookies/accept", ih.AcceptCookies)
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
			auth.DELETE("/user", lh.HandleDeleteLoginUser)
			auth.GET("/logout", lh.HandleLogout)
			auth.GET("/:provider/callback", lh.HandleCallback)
		}
	}
}

func SetAPIKeyRoutes(r gin.IRouter, ah apikey.IAPIKeyHandler) {
	v1 := r.Group(APIBasePath)
	{
		apikey := v1.Group("/api-keys")
		{
			apikey.GET("/:id", ah.GetAPIKey)
			apikey.POST("", ah.CreateAPIKey)
			apikey.GET("", ah.ListAPIKeysByUser)
			apikey.DELETE("/:id", ah.DeleteAPIKey)
		}
	}
}

func SetAdminRoutes(r gin.IRouter, ah *handler.AdminHandler) {
	v1 := r.Group(APIBasePath)
	{
		admin := v1.Group("/admin")
		admin.Use(ah.RequireAdmin())
		{
			// Dashboard endpoints
			admin.GET("/stats", ah.GetDashboardStats)
			admin.GET("/chart-data", ah.GetChartData)
		}
	}
}
