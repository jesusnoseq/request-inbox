package main

import (
	"context"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
	"github.com/jesusnoseq/request-inbox/pkg/route"
)

func main() {
	config.LoadConfig(config.API)
	err := config.ConfigureLog()
	if err != nil {
		log.Fatal("configuring log", err)
	}

	r := gin.Default()

	r.HandleMethodNotAllowed = true
	r.NoMethod(handler.MethodNotAllowedHandler)
	r.NoRoute(handler.NotFoundHandler)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	ctx := context.Background()
	dao, err := database.GetInboxDAO(ctx, database.GetDatabaseEngine(config.GetString(config.DBEngine)))
	defer func() {
		err := dao.Close(ctx)
		if err != nil {
			log.Fatal("error closing DB:", err)
		}
	}()
	if err != nil {
		log.Fatal("failed to obtain InboxDAO:", err)
	}

	ih := handler.NewInboxHandler(dao)
	route.SetInboxRoutes(r, ih)

	err = r.Run(":" + config.GetString(config.APIHTTPPort))
	if err != nil {
		log.Fatal("server was closed", err)
	}
}
