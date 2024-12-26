package login

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
)

const USER_CONTEXT_KEY = "user"
const IS_LOGGED_IN_CONTEXT_KEY = "is_logged_in"
const IS_LOGGED_WITH_API_KEY_CONTEXT_KEY = "logged_with_api_key"
const IS_LOGGED_WITH_COOKIE_CONTEXT_KEY = "logged_with_cookie"
const LOGIN_ERROR_CONTEXT_KEY = "login_error"

func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(IS_LOGGED_IN_CONTEXT_KEY, false)
		c.Set(LOGIN_ERROR_CONTEXT_KEY, nil)
		c.Set(USER_CONTEXT_KEY, nil)
		c.Set(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY, false)
		c.Set(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY, false)

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

		c.Set(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY, true)
		c.Set(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY, false)
	}
}

func APIKeyMiddleware(dao database.InboxDAO) gin.HandlerFunc {
	return func(c *gin.Context) {
		code := c.GetHeader("X-API-KEY")
		if code == "" {
			return
		}
		if c.GetBool(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY) {
			return
		}
		valid, err := validation.IsAPIKey(code)
		if !valid {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(err, http.StatusUnauthorized))
			return
		}
		akID := model.NewAPIKeyID(code)
		ak, err := dao.GetAPIKey(c, akID)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(fmt.Errorf("API key is no valid"), http.StatusUnauthorized))
			return
		}

		if !ak.IsActive {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(fmt.Errorf("API key is not active"), http.StatusUnauthorized))
			return
		}

		if !ak.ExpiryDate.IsZero() && ak.ExpiryDate.UTC().Before(time.Now().UTC()) {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(fmt.Errorf("API key has expired"), http.StatusUnauthorized))
			return
		}

		user, err := dao.GetUser(c, ak.OwnerID)
		if err != nil {
			c.AbortWithStatusJSON(model.ErrorResponseFromError(fmt.Errorf("API key is no valid"), http.StatusUnauthorized))
			return
		}

		c.Set(IS_LOGGED_IN_CONTEXT_KEY, true)
		c.Set(USER_CONTEXT_KEY, user)

		c.Set(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY, false)
		c.Set(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY, true)
	}
}
