package login

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

func TestJWTMiddlewareOK(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	user := model.User{
		ID:    uuid.New(),
		Email: "test@mail.dev",
	}
	expiredToken, _ := GenerateJWT(user, 24*time.Hour)
	c.Request, _ = http.NewRequest("GET", "/", nil)
	c.Request.AddCookie(&http.Cookie{
		Name:  AuthTokenCookieName,
		Value: expiredToken,
	})

	middleware := JWTMiddleware()
	middleware(c)

	t_util.AssertTrue(t, c.GetBool(IS_LOGGED_IN_CONTEXT_KEY))
	t_util.AssertTrue(t, c.GetBool(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY))
	context_user, err := GetUser(c)
	t_util.AssertNoError(t, err)
	t_util.AssertStructIsNotEmpty(t, context_user)
	t_util.AssertStringEquals(t, c.GetString(LOGIN_ERROR_CONTEXT_KEY), "")
}

func TestJWTMiddlewareTokenExpired(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	user := model.User{
		ID:    uuid.New(),
		Email: "test@mail.dev",
	}
	expiredToken, _ := GenerateJWT(user, -24*time.Hour)
	c.Request, _ = http.NewRequest("GET", "/", nil)
	c.Request.AddCookie(&http.Cookie{
		Name:  AuthTokenCookieName,
		Value: expiredToken,
	})

	middleware := JWTMiddleware()
	middleware(c)

	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_IN_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY))
	context_user, err := GetUser(c)
	t_util.AssertError(t, err)
	t_util.AssertStringContains(t, err.Error(), "token is expired")
	t_util.AssertStructIsEmpty(t, context_user)
}

func TestJWTMiddlewareNoToken(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/", nil)

	middleware := JWTMiddleware()
	middleware(c)

	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_IN_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY))
	context_user, err := GetUser(c)
	t_util.AssertError(t, err)
	t_util.AssertStructIsEmpty(t, context_user)
	t_util.AssertStringContains(t, err.Error(), "the user is not logged in")
}

func mustGetInboxDao() (database.InboxDAO, func()) {
	ctx := context.Background()
	dao, err := database.GetInboxDAO(ctx, database.Badger)
	if err != nil {
		panic(err)
	}
	return dao, func() {
		dao.Close(ctx)
	}
}

func TestAPIKeyMiddlewareOK(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/", nil)

	dao, closer := mustGetInboxDao()
	defer closer()

	user := model.GenerateUser()
	_, err := dao.UpsertUser(c, user)
	t_util.RequireNoError(t, err)
	apiKey, err := model.NewAPIKey(user.ID)
	t_util.RequireNoError(t, err)
	err = dao.CreateAPIKey(c, apiKey)
	t_util.RequireNoError(t, err)
	c.Request.Header.Add("X-API-KEY", apiKey.APIKey)

	middleware := APIKeyMiddleware(dao)
	middleware(c)

	t_util.AssertTrue(t, c.GetBool(IS_LOGGED_IN_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY))
	t_util.AssertTrue(t, c.GetBool(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY))
	context_user, err := GetUser(c)
	t_util.AssertNoError(t, err)
	t_util.AssertStructIsNotEmpty(t, context_user)
}

func TestAPIKeyMiddlewareExpired(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/", nil)

	dao, closer := mustGetInboxDao()
	defer closer()

	user := model.GenerateUser()
	_, err := dao.UpsertUser(c, user)
	t_util.RequireNoError(t, err)
	apiKey, err := model.NewAPIKey(user.ID)
	apiKey.ExpiryDate = time.Now().Add(-time.Hour)
	t_util.RequireNoError(t, err)
	err = dao.CreateAPIKey(c, apiKey)
	t_util.RequireNoError(t, err)
	c.Request.Header.Add("X-API-KEY", apiKey.APIKey)

	middleware := APIKeyMiddleware(dao)
	middleware(c)

	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_IN_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY))

	context_user, err := GetUser(c)
	t_util.AssertError(t, err)
	t_util.AssertStructIsEmpty(t, context_user)

	resp := w.Result()
	resp.Body.Close()
	t_util.AssertStatusCode(t, resp.StatusCode, http.StatusUnauthorized)
	t_util.AssertStringContains(t, w.Body.String(), "API key has expired")
}

func TestAPIKeyMiddlewareNoToken(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request, _ = http.NewRequest("GET", "/", nil)

	dao, closer := mustGetInboxDao()
	defer closer()

	middleware := APIKeyMiddleware(dao)
	middleware(c)

	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_IN_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_COOKIE_CONTEXT_KEY))
	t_util.AssertFalse(t, c.GetBool(IS_LOGGED_WITH_API_KEY_CONTEXT_KEY))
	context_user, err := GetUser(c)
	t_util.AssertError(t, err)
	t_util.AssertStructIsEmpty(t, context_user)
	t_util.AssertStringContains(t, err.Error(), "the user is not logged in")

	resp := w.Result()
	resp.Body.Close()
	t_util.AssertStatusCode(t, resp.StatusCode, http.StatusOK)
}
