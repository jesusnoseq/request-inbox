package login

import "github.com/gin-gonic/gin"

//go:generate mockgen -destination=login_mock/oauth_mock.go -package=login_mock github.com/jesusnoseq/request-inbox/pkg/login ILoginHandler

type ILoginHandler interface {
	HandleLogin(c *gin.Context)
	HandleCallback(c *gin.Context)
	HandleLoginUser(c *gin.Context)
	HandleLogout(c *gin.Context)
}
