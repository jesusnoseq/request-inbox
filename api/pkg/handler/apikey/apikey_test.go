package apikey

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/go-cmp/cmp"
	"github.com/jesusnoseq/request-inbox/pkg/collection"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/login"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/model/validation"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

func mustGetAPIKeyHandler() (*APIKeyHandler, func()) {
	ctx := context.Background()
	dao, err := database.GetInboxDAO(ctx, database.Badger)
	if err != nil {
		panic(err)
	}
	return NewAPIKeyHandler(dao), func() {
		dao.Close(ctx)
	}
}

func mustParseAPIKey(payload []byte) model.APIKey {
	ak := model.APIKey{}
	err := json.Unmarshal(payload, &ak)
	if err != nil {
		panic(err)
	}
	return ak
}

func AssertIsValidAPIKey(t *testing.T, apiKey string) {
	t.Helper()
	ok, err := validation.IsAPIKey(apiKey)
	if !ok {
		t.Fatalf("API key %v is invalid: %s", apiKey, err)
	}
}

func ApiKeyEquals(a, b model.APIKey) bool {
	return cmp.Equal(a, b)
}

type APIKeyParams struct {
	Name       string
	ExpiryDate time.Time
}

func mustCreateAndSetLoggedUser(t *testing.T, ctx *gin.Context, dao database.InboxDAO, email string) model.User {
	t.Helper()
	user := model.NewUser(email)
	err := dao.UpsertUser(ctx, user)
	if err != nil {
		panic(err)
	}
	ctx.Set(login.USER_CONTEXT_KEY, user)
	ctx.Set(login.IS_LOGGED_IN_CONTEXT_KEY, true)
	ctx.Set(login.IS_LOGGED_WITH_COOKIE_CONTEXT_KEY, true)
	return user
}

func mustCreateAPIKey(t *testing.T, dao database.InboxDAO, user model.User, p APIKeyParams) model.APIKey {
	t.Helper()
	ctx := context.Background()
	apikey, err := model.NewAPIKey(user.ID)
	if err != nil {
		panic(err)
	}
	apikey.Name = p.Name
	apikey.ExpiryDate = p.ExpiryDate
	err = dao.CreateAPIKey(ctx, apikey)
	if err != nil {
		panic(err)
	}
	return apikey
}

func TestCreateAPIKey(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	handler, closer := mustGetAPIKeyHandler()
	defer closer()
	user := mustCreateAndSetLoggedUser(t, ginCtx, handler.dao, "test@mail.dev")
	apikey := APIKeyParams{
		Name:       "TestKey",
		ExpiryDate: time.Now().AddDate(0, 1, 0),
	}
	body := t_util.MustJson(t, apikey)
	req, err := http.NewRequest(
		"POST",
		"",
		bytes.NewReader(body),
	)
	if err != nil {
		panic(err)
	}
	ginCtx.Request = req

	handler.CreateAPIKey(ginCtx)

	resp := w.Result()
	resp.Body.Close()
	t_util.AssertStatusCode(t, http.StatusCreated, resp.StatusCode)
	createdAPIKey := mustParseAPIKey(w.Body.Bytes())
	t_util.AssertSameID(t, createdAPIKey.ID, model.NewAPIKeyID(createdAPIKey.APIKey))
	t_util.AssertTrue(t, createdAPIKey.IsActive, "IsActive")
	AssertIsValidAPIKey(t, createdAPIKey.APIKey)
	t_util.AssertSameID(t, createdAPIKey.OwnerID, user.ID)
	t_util.AssertTimeDiffFromNow(t, createdAPIKey.CreationDate, 0, time.Duration(1)*time.Second)
	t_util.AssertTimeDiffFromNow(t, createdAPIKey.ExpiryDate, 30*time.Duration(24)*time.Hour, 3*time.Duration(24)*time.Hour)
}

func TestCreateAPIKeyUnauthorized(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	handler, closer := mustGetAPIKeyHandler()
	defer closer()
	user := model.NewUser("test@mail.com")
	apikey := mustCreateAPIKey(t, handler.dao, user, APIKeyParams{"testapikey", time.Now().Add(time.Hour)})

	body := t_util.MustJson(t, apikey)
	req, err := http.NewRequest(
		"POST",
		"",
		bytes.NewReader(body),
	)
	if err != nil {
		panic(err)
	}
	ginCtx.Request = req

	handler.CreateAPIKey(ginCtx)

	resp := w.Result()
	resp.Body.Close()
	t_util.AssertStatusCode(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestGetAPIKey(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	handler, closer := mustGetAPIKeyHandler()
	defer closer()
	user := mustCreateAndSetLoggedUser(t, ginCtx, handler.dao, "test@mail.dev")
	apiKey := mustCreateAPIKey(t, handler.dao, user, APIKeyParams{"testapikey", time.Now().Add(time.Hour)})

	req, err := http.NewRequest(
		"GET",
		"",
		nil,
	)
	if err != nil {
		panic(err)
	}
	ginCtx.AddParam("id", apiKey.ID.String())
	ginCtx.Request = req

	handler.GetAPIKey(ginCtx)

	t_util.AssertStatusCode(t, http.StatusOK, w.Code)
	var returnedAPIKey model.APIKey
	if err := json.NewDecoder(w.Body).Decode(&returnedAPIKey); err != nil {
		t.Fatalf("expected valid API key JSON response, got error: %v", err)
	}
	t_util.AssertSameID(t, apiKey.ID, returnedAPIKey.ID)
	if string(t_util.MustJson(t, apiKey)) != string(t_util.MustJson(t, returnedAPIKey)) {
		t.Fatalf("expected the same API key in the JSON response \n%+v\n --- \n%+v", apiKey, returnedAPIKey)
	}
}

func TestListAPIKeysByUser(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	handler, closer := mustGetAPIKeyHandler()
	defer closer()
	user := mustCreateAndSetLoggedUser(t, ginCtx, handler.dao, "test@mail.dev")
	apiKey1 := mustCreateAPIKey(t, handler.dao, user, APIKeyParams{"testapikey1", time.Now().Add(time.Hour)})
	apiKey2 := mustCreateAPIKey(t, handler.dao, user, APIKeyParams{"testapikey2", time.Now().Add(time.Hour)})

	otherUser := model.NewUser("other@mail.dev")
	otherApiKey := mustCreateAPIKey(t, handler.dao, otherUser, APIKeyParams{"testapikey3", time.Now().Add(time.Hour)})

	req, err := http.NewRequest(
		"GET",
		"",
		nil,
	)
	if err != nil {
		panic(err)
	}
	ginCtx.Request = req

	handler.ListAPIKeysByUser(ginCtx)

	t_util.AssertStatusCode(t, http.StatusOK, w.Code)

	var apiKeys model.ItemList[model.APIKey]
	if err := json.NewDecoder(w.Body).Decode(&apiKeys); err != nil {
		t.Fatalf("expected valid Item list of API key JSON response, got error: %v", err)
	}
	t_util.AssertTrue(t, len(apiKeys.Results) >= 2, "Results len should be at least 2")
	if !collection.SliceOfAnyContains(apiKeys.Results, apiKey1, ApiKeyEquals) {
		t.Errorf("API key list does not contains apiKey1 %+v", apiKey1)
	}
	if !collection.SliceOfAnyContains(apiKeys.Results, apiKey2, ApiKeyEquals) {
		t.Errorf("API key list does not contains apiKey2 %+v", apiKey2)
	}
	if collection.SliceOfAnyContains(apiKeys.Results, otherApiKey, ApiKeyEquals) {
		t.Errorf("API key list contains otherApiKey %+v", otherApiKey)
	}
}

func TestDeleteAPIKey(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	handler, closer := mustGetAPIKeyHandler()
	defer closer()
	user := mustCreateAndSetLoggedUser(t, ginCtx, handler.dao, "test@mail.dev")
	apiKey := mustCreateAPIKey(t, handler.dao, user, APIKeyParams{"testapikey", time.Now().Add(time.Hour)})
	otherUser := model.NewUser("other@mail.dev")
	otherApiKey := mustCreateAPIKey(t, handler.dao, otherUser, APIKeyParams{"other testapikey", time.Now().Add(time.Hour)})

	req, err := http.NewRequest("DELETE", "", nil)
	if err != nil {
		panic(err)
	}
	ginCtx.AddParam("id", apiKey.ID.String())
	ginCtx.Request = req

	handler.DeleteAPIKey(ginCtx)

	t_util.AssertStatusCode(t, http.StatusNoContent, w.Code)
	result, err := handler.dao.GetAPIKey(ginCtx, apiKey.ID)
	t_util.AssertError(t, err)
	t_util.AssertStructIsEmpty(t, result)

	result, err = handler.dao.GetAPIKey(ginCtx, otherApiKey.ID)
	t_util.AssertStructIsNotEmpty(t, result)
	t_util.AssertNoError(t, err)
}

func TestDeleteOtherUserAPIKey(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	handler, closer := mustGetAPIKeyHandler()
	defer closer()
	_ = mustCreateAndSetLoggedUser(t, ginCtx, handler.dao, "test@mail.dev")
	otherUser := model.NewUser("other@mail.dev")
	otherApiKey := mustCreateAPIKey(t, handler.dao, otherUser, APIKeyParams{"other testapikey", time.Now().Add(time.Hour)})

	req, err := http.NewRequest("DELETE", "", nil)
	if err != nil {
		panic(err)
	}
	ginCtx.AddParam("id", otherApiKey.ID.String())
	ginCtx.Request = req

	handler.DeleteAPIKey(ginCtx)

	t_util.AssertStatusCode(t, http.StatusNotFound, w.Code)
	result, err := handler.dao.GetAPIKey(ginCtx, otherApiKey.ID)
	t_util.AssertNoError(t, err)
	t_util.AssertStructIsNotEmpty(t, result)
}
