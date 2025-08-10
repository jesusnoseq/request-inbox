package login

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation"
	"github.com/jesusnoseq/request-inbox/pkg/login/provider"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type LoginHandler struct {
	dao database.InboxDAO
	pm  provider.IProviderManager
	et  instrumentation.EventTracker
}

func NewLoginHandler(dao database.InboxDAO, et instrumentation.EventTracker) *LoginHandler {
	return &LoginHandler{
		dao: dao,
		pm:  provider.NewProviderManager(),
		et:  et,
	}
}

func (lh *LoginHandler) HandleLogin(c *gin.Context) {
	p := c.Param("provider")
	oauthConfig, exists := lh.pm.GetOAuthConfig(p)
	if !exists {
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Provider not supported", http.StatusBadRequest))
		return
	}
	oauthStateString := generateStateString()
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie(
		OauthStateCookieName,
		oauthStateString,
		3600,
		"/",
		config.GetString(config.AuthCookieDomain),
		true,
		true,
	)
	url := oauthConfig.Config.AuthCodeURL(oauthStateString)

	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (lh *LoginHandler) HandleCallback(c *gin.Context) {
	p := c.Param("provider")
	oauthConfig, exists := lh.pm.GetOAuthConfig(p)
	if !exists {
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Provider not supported", http.StatusBadRequest))
		return
	}

	oauthState, _ := c.Cookie(OauthStateCookieName)
	state := c.Query("state")
	if state != oauthState {
		if err := lh.et.Track(c, instrumentation.UserLoginEvent{BaseEvent: instrumentation.BaseEvent{UserID: "state"}, Provider: p, Success: false}); err != nil {
			instrumentation.LogError(c, err, "Failed to track login event")
		}
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Invalid state", http.StatusUnauthorized))
		return
	}

	code := c.Query("code")
	token, err := oauthConfig.Config.Exchange(c, code)
	if err != nil {
		instrumentation.LogError(c, err, "Failed to exchange token")
		if err := lh.et.Track(c, instrumentation.UserLoginEvent{BaseEvent: instrumentation.BaseEvent{UserID: "exchange"}, Provider: p, Success: false}); err != nil {
			instrumentation.LogError(c, err, "Failed to track login event")
		}
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Failed to exchange token", http.StatusInternalServerError))
		return
	}

	client := oauthConfig.Config.Client(c, token)
	userResponse, err := client.Get(oauthConfig.UserInfoURL)
	if err != nil {
		instrumentation.LogError(c, err, "Failed to get user info")
		if err := lh.et.Track(c, instrumentation.UserLoginEvent{BaseEvent: instrumentation.BaseEvent{UserID: "userinfo"}, Provider: p, Success: false}); err != nil {
			instrumentation.LogError(c, err, "Failed to track login event")
		}
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Failed to get user info", http.StatusInternalServerError))
		return
	}
	defer userResponse.Body.Close()
	body, err := io.ReadAll(userResponse.Body)
	if err != nil {
		instrumentation.LogError(c, err, "Failed to read user info")
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Failed to read user info", http.StatusInternalServerError))
		return
	}
	slog.Debug("HandleCallback get userinfo", "body", body)

	user, err := lh.pm.ExtractUser(p, token, body)
	if err != nil {
		instrumentation.LogError(c, err, "Failed to parse user info")
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Failed to parse user info", http.StatusInternalServerError))
		return
	}
	isNewUser, err := lh.dao.UpsertUser(c.Request.Context(), user)
	if err != nil {
		instrumentation.LogError(c, err, "Failed to save user", "user", user)
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Failed to save user", http.StatusInternalServerError))
		return
	}
	if isNewUser {
		if err := lh.et.Track(c, instrumentation.UserSignupEvent{
			BaseEvent: instrumentation.BaseEvent{UserID: user.ID.String()},
			Provider:  user.Provider.Provider,
		}); err != nil {
			instrumentation.LogError(c, err, "Failed to track signup event")
		}
		slog.Info("New user registered", "ip", c.ClientIP(), "user", user.Email)
	} else {
		if err := lh.et.Track(c, instrumentation.UserLoginEvent{
			BaseEvent: instrumentation.BaseEvent{UserID: user.ID.String()},
			Provider:  user.Provider.Provider,
			Success:   true,
		}); err != nil {
			instrumentation.LogError(c, err, "Failed to track login event")
		}
		slog.Info("Existing user logged in", "ip", c.ClientIP(), "user", user.Email)
	}
	jwtToken, err := GenerateJWT(user, 24*time.Hour)
	if err != nil {
		instrumentation.LogError(c, err, "Failed to generate jwt with user info", "user", user)
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Failed to generate jwt with user info", http.StatusInternalServerError))
		return
	}

	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie(
		AuthTokenCookieName,
		jwtToken,
		60*60,
		"/",
		config.GetString(config.AuthCookieDomain),
		true,
		true,
	)
	c.Redirect(http.StatusTemporaryRedirect, config.GetString(config.FrontendApplicationURL))
}

func IsUserLoggedIn(c *gin.Context) bool {
	return c.GetBool(IS_LOGGED_IN_CONTEXT_KEY)
}

func GetUser(c *gin.Context) (model.User, error) {
	errVal, _ := c.Get(LOGIN_ERROR_CONTEXT_KEY)
	err, _ := errVal.(error)
	if err != nil {
		return model.User{}, err
	}
	if !c.GetBool(IS_LOGGED_IN_CONTEXT_KEY) {
		return model.User{}, fmt.Errorf("the user is not logged in")
	}
	userVal, exists := c.Get(USER_CONTEXT_KEY)
	if !exists {
		return model.User{}, fmt.Errorf("the user is not logged in")
	}
	user, ok := userVal.(model.User)
	if !ok {
		return model.User{}, fmt.Errorf("there was an error with your user")
	}
	return user, nil
}

func (lh *LoginHandler) HandleLoginUser(c *gin.Context) {
	token, _ := c.Cookie(AuthTokenCookieName)
	if token == "" {
		c.AbortWithStatusJSON(http.StatusNoContent, nil)
		return
	}
	user, err := ReadJWTToken(token)
	if err != nil {
		slog.Error("Token not valid", "JWT", token, "error", err)
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Token not valid", http.StatusUnauthorized))
		return
	}

	c.JSON(http.StatusOK, user)
}

func (lh *LoginHandler) HandleLogout(c *gin.Context) {
	cookie := http.Cookie{
		Name:     AuthTokenCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		MaxAge:   -1, // Deletes the cookie
	}
	c.SetSameSite(http.SameSiteNoneMode)
	http.SetCookie(c.Writer, &cookie)
	c.JSON(http.StatusOK, gin.H{"message": "You have successfully logged out"})
}

func (lh *LoginHandler) HandleDeleteLoginUser(c *gin.Context) {
	token, _ := c.Cookie(AuthTokenCookieName)
	if token == "" {
		c.AbortWithStatusJSON(http.StatusNoContent, nil)
		return
	}
	user, err := ReadJWTToken(token)
	if err != nil {
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Token not valid", http.StatusUnauthorized))
		return
	}
	err = lh.dao.DeleteUser(c, user.ID)
	if err != nil {
		instrumentation.LogError(c, err, "Failed to delete user info", "user", user)
		c.AbortWithStatusJSON(model.ErrorResponseMsg("Error deleting user", http.StatusUnauthorized))
		return
	}
	lh.HandleLogout(c)
}
