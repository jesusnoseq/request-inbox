package login

import (
	"github.com/gin-gonic/gin"
)

const USER_CONTEXT_KEY = "user"
const IS_LOGGED_IN_CONTEXT_KEY = "is_logged_in"
const LOGIN_ERROR_CONTEXT_KEY = "login_error"

func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(IS_LOGGED_IN_CONTEXT_KEY, false)
		c.Set(LOGIN_ERROR_CONTEXT_KEY, nil)
		c.Set(USER_CONTEXT_KEY, nil)
		token, _ := c.Cookie(AuthTokenCookieName)
		if token == "" {
			return
		}
		user, err := ReadJWTToken(token)
		if err != nil {
			c.Set(LOGIN_ERROR_CONTEXT_KEY, err)
			return
		}
		c.Set(IS_LOGGED_IN_CONTEXT_KEY, true)
		c.Set(USER_CONTEXT_KEY, user)
	}
}
