package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
)

func main() {
	config.LoadConfig(config.API)
	err := config.ConfigureLog()
	if err != nil {
		log.Fatal("configuring log", err)
	}

	r := gin.Default()

	// Serve static files from the "static" folder
	r.Static("/static", "./static")

	// Define the routes and their handlers
	v1 := r.Group("/api/v1")
	{
		inboxs := v1.Group("/inboxs")
		{
			inboxs.GET("/", handler.ListInboxs)
			inboxs.POST("/", handler.CreateInbox)
			inboxs.DELETE("/:id", handler.DeleteInbox)
			inboxs.GET("/:id", handler.GetInbox)
			inboxs.Any("/:id/in/", handler.InboxRequest)
		}
	}

	// Serve the web page at the root path
	r.LoadHTMLGlob("../static/*.html")
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	err = r.Run(":" + config.GetString(config.APIHTTPPort))
	if err != nil {
		log.Fatal("server was closed", err)
	}
}
