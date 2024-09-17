package main

import (
	"context"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/route"
)

func main() {
	config.LoadConfig(config.API)
	err := instrumentation.ConfigureLog()
	if err != nil {
		log.Fatal("error configuring log", err)
	}

	mode := config.GetString(config.APIMode)
	if mode == config.APIModeLambda {
		lambda.Start(Handler)
	} else {
		startServer()
	}
}

var ginLambda *ginadapter.GinLambda

func Handler(
	ctx context.Context,
	req events.APIGatewayProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	if ginLambda == nil {
		slog.Debug("Gin cold start")
		router, closer := getRouter()
		ginLambda = ginadapter.New(router)
		go func() {
			log.Println("Closing lambda server")
			quit := make(chan os.Signal, 1)
			signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
			<-quit
			closer()
			log.Println("Lambda server closed!")
		}()
	}

	return ginLambda.ProxyWithContext(ctx, req)
}

func startServer() {
	r, closer := getRouter()
	defer closer()
	config.PrintConfig()
	srv := &http.Server{
		Addr:           ":" + config.GetString(config.APIHTTPPort),
		Handler:        r,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server was closed", err)
		}
	}()
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown with error", err)
	}
	<-ctx.Done()
	slog.Info("Goodbye!")
}

func getRouter() (*gin.Engine, func()) {
	r := gin.Default()

	r.HandleMethodNotAllowed = true
	r.NoMethod(handler.MethodNotAllowedHandler)
	r.NoRoute(handler.NotFoundHandler)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	ctx := context.Background()
	dao, err := database.GetInboxDAO(ctx, database.GetDatabaseEngine(config.GetString(config.DBEngine)))
	closer := func() {
		err := dao.Close(ctx)
		if err != nil {
			log.Fatal("error closing DB:", err)
		}
	}
	if err != nil {
		log.Fatal("failed to obtain InboxDAO:", err)
	}

	r.Use(login.JWTMiddleware())
	lh := login.NewLoginHandler(dao)
	route.SetLoginRoutes(r, lh)

	ih := handler.NewInboxHandler(dao)
	route.SetInboxRoutes(r, ih)
	route.SetUtilityRoutes(r, ih)

	return r, closer
}
