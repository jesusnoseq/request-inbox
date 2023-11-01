package route

import (
	"github.com/gin-gonic/gin"
)

func SetStaticRoutes(r gin.IRouter, staticFilesFolderPath string) {
	// Serve static files from the "static" folder
	r.Static("/static", staticFilesFolderPath)
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})
}
