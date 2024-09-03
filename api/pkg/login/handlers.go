package login

import (
	"context"
	"io"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/login/provider"
)

type LoginHandler struct {
	dao database.InboxDAO
}

func NewLoginHandler(dao database.InboxDAO) *LoginHandler {
	return &LoginHandler{
		dao: dao,
	}
}

func (lh *LoginHandler) HandleLogin(c *gin.Context) {
	p := c.Param("provider")
	oauthConfig, exists := provider.GetOAuthConfig(p)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provider not supported"})
		return
	}
	oauthStateString := generateStateString()
	c.SetCookie(OauthStateCookieName, oauthStateString, 3600, "/", "localhost", false, true)
	url := oauthConfig.Config.AuthCodeURL(oauthStateString)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (lh *LoginHandler) HandleCallback(c *gin.Context) {
	p := c.Param("provider")
	oauthConfig, exists := provider.GetOAuthConfig(p)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Provider not supported"})
		return
	}

	oauthState, _ := c.Cookie(OauthStateCookieName)
	state := c.Query("state")
	if state != oauthState {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid state"})
		return
	}

	code := c.Query("code")
	token, err := oauthConfig.Config.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	client := oauthConfig.Config.Client(context.Background(), token)
	userResponse, err := client.Get(oauthConfig.UserInfoURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
		return
	}
	defer userResponse.Body.Close()
	body, err := io.ReadAll(userResponse.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read user info"})
		return
	}
	slog.Info("BODY ", "user", body)
	slog.Info("token ", "token", token)

	user, err := provider.ExtractUser(p, token, body)
	lh.dao.UpsertUser(c.Request.Context(), user)
	jwtToken, err := GenerateJWT(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read user info"})
		return
	}

	secureCookie := true
	if config.FrontendApplicationURLDefault == config.GetString(config.FrontendApplicationURL) {
		secureCookie = false
	}
	cookie := http.Cookie{
		Name:     AuthTokenCookieName,
		Value:    jwtToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   secureCookie,
		SameSite: http.SameSiteNoneMode,
		Domain:   config.GetString(config.AuthCookieDomain),
		MaxAge:   3600,
	}
	http.SetCookie(c.Writer, &cookie)
	c.Redirect(http.StatusTemporaryRedirect, config.GetString(config.FrontendApplicationURL))
}

func (lh *LoginHandler) HandleLoginUser(c *gin.Context) {
	token, _ := c.Cookie(AuthTokenCookieName)
	if token == "" {
		c.JSON(http.StatusNoContent, nil)
		return
	}
	claims, err := ParseToken(token)
	if err != nil {
		slog.Error("Token not valid", "JWT", token)
		c.JSON(http.StatusUnauthorized, "JWT not vaid")
		return
	}
	user := claims.User

	//if err != nil {
	//	slog.Error("Token not valid", "JWT", token)
	//	c.JSON(http.StatusUnauthorized, "JWT not vaid")
	//	return
	//}

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
	http.SetCookie(c.Writer, &cookie)
	c.JSON(http.StatusOK, gin.H{"message": "You have successfully logged out"})
}
