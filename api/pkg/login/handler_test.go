package login

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/instrumentation"
	"github.com/jesusnoseq/request-inbox/pkg/login/provider"
	"github.com/jesusnoseq/request-inbox/pkg/login/provider/provider_mock"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
	"golang.org/x/oauth2"
)

func mustGetLoginHandler() (*LoginHandler, func()) {
	ctx := context.Background()
	dao, err := database.GetInboxDAO(ctx, database.Badger)
	if err != nil {
		panic(err)
	}
	et, err := instrumentation.NewEventTracker()
	if err != nil {
		panic(err)
	}
	return NewLoginHandler(dao, et), func() {
		err := dao.Close(ctx)
		if err != nil {
			panic(err)
		}
	}
}

func findCookie(cookies []*http.Cookie, name string) *http.Cookie {
	for _, cookie := range cookies {
		if cookie.Name == name {
			return cookie
		}
	}
	return nil
}

func TestHandleLogout(t *testing.T) {
	config.LoadConfig(config.Test)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	lh := &LoginHandler{}

	lh.HandleLogout(c)

	resp := w.Result()
	err := resp.Body.Close()
	if err != nil {
		t.Fatalf("Failed to close response body: %v", err)
	}
	t_util.AssertStatusCode(t, resp.StatusCode, http.StatusOK)
	var response map[string]string
	err = json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil {
		t.Fatalf("Failed to unmarshal response body: %v", err)
	}

	cookies := w.Header()["Set-Cookie"]
	if len(cookies) != 1 {
		t.Fatalf("Expected 1 cookie, got %d", len(cookies))
	}

	cookie := cookies[0]
	t_util.AssertStringEquals(t, cookie, "auth_token=; Path=/; Max-Age=0; HttpOnly; Secure")
}

// Based on https://www.devgem.io/posts/testing-oauth2-client-with-a-mock-tokenurl-endpoint
func OauthServerHandlers(t *testing.T) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/auth", func(w http.ResponseWriter, r *http.Request) {
		baseURL, err := url.Parse(r.URL.Query().Get("redirect_uri"))
		if err != nil {
			t.Fatal("error parsing redirect URL", err)
		}
		parameters := url.Values{}
		parameters.Add("code", "mockcode")
		parameters.Add("state", r.URL.Query().Get("state"))
		baseURL.RawQuery = parameters.Encode()
		http.Redirect(w, r, baseURL.String(), http.StatusFound)
	})

	// Handle /token endpoint
	mux.HandleFunc("/token", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(`{"access_token": "mocktoken", "id_token": "mockidtoken", "token_type": "bearer"}`))
		t_util.AssertNoError(t, err)
	})

	// Handle /introspect endpoint
	mux.HandleFunc("/introspect", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(`{"active": true}`))
		t_util.AssertNoError(t, err)
	})

	mux.HandleFunc("/userinfo", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, err := w.Write([]byte(`{"email": "test@mail.dev"}`))
		t_util.AssertNoError(t, err)
	})
	return mux
}

func getMockOauthConfig(serverURL string) provider.OAuthConfig {
	return provider.OAuthConfig{
		Config: &oauth2.Config{
			ClientID:     "clientID",
			ClientSecret: "clientSecret",
			Endpoint: oauth2.Endpoint{
				AuthURL:  serverURL + "/auth",
				TokenURL: serverURL + "/token",
			},
			RedirectURL: serverURL + "/introspect",
			Scopes:      []string{"scopes"},
		},
		UserInfoURL: serverURL + "/userinfo",
	}
}

func TestHandleLogin(t *testing.T) {
	config.LoadConfig(config.Test)

	lh, closer := mustGetLoginHandler()
	defer closer()
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	server := httptest.NewServer(OauthServerHandlers(t))
	defer server.Close()

	config.Set(config.FrontendApplicationURL, server.URL)
	config.Set(config.AuthCookieDomain, "localhost")

	pm := provider_mock.NewMockIProviderManager(mockCtrl)
	pm.EXPECT().GetOAuthConfig("mock").Return(getMockOauthConfig(server.URL), true).Times(1)
	pm.EXPECT().GetOAuthConfig("invalid").Return(provider.OAuthConfig{}, false).Times(1)
	pm.EXPECT().ExtractUser(gomock.Any(), gomock.Any(), gomock.Any()).Times(0)
	lh.pm = pm

	testCases := []struct {
		name           string
		provider       string
		expectedStatus int
		expectedURL    string
	}{
		{
			name:           "Valid Provider",
			provider:       "mock",
			expectedStatus: http.StatusTemporaryRedirect,
			expectedURL: func() string {
				baseURL, err := url.Parse(server.URL + "/auth")
				if err != nil {
					t.Fatal("error parsing test case URL", err)
				}
				parameters := url.Values{}
				parameters.Add("client_id", "clientID")
				parameters.Add("redirect_uri", server.URL+"/introspect")
				parameters.Add("response_type", "code")
				parameters.Add("scope", "scopes")
				baseURL.RawQuery = parameters.Encode()
				return baseURL.String()
			}(),
		},
		{
			name:           "Invalid Provider",
			provider:       "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedURL:    "",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ginCtx, _ := gin.CreateTestContext(w)
			ginCtx.AddParam("provider", tc.provider)
			ginCtx.Request = t_util.MustRequest(t, "GET", "auth/"+tc.provider+"/login/", nil)

			lh.HandleLogin(ginCtx)

			resp := w.Result()
			err := resp.Body.Close()
			if err != nil {
				panic(err)
			}
			t_util.AssertStatusCode(t, resp.StatusCode, tc.expectedStatus)

			if tc.expectedStatus != http.StatusTemporaryRedirect {
				return
			}

			location := resp.Header.Get("Location")
			if !strings.HasPrefix(location, tc.expectedURL) {
				t.Errorf("Expected redirect to %s, got %s", tc.expectedURL, location)
			}

			oauthStateCookie := findCookie(resp.Cookies(), OauthStateCookieName)
			if oauthStateCookie == nil {
				t.Fatal("OAuth state cookie not set")
			}

			t_util.AssertNotEquals(t, oauthStateCookie.Value, "")
			t_util.AssertEquals(t, oauthStateCookie.MaxAge, 3600)
			t_util.AssertStringEquals(t, oauthStateCookie.Path, "/")
			t_util.AssertStringEquals(t, oauthStateCookie.Domain, "localhost")
			t_util.AssertTrue(t, oauthStateCookie.HttpOnly)
			t_util.AssertTrue(t, oauthStateCookie.Secure)
			t_util.AssertEquals(t, oauthStateCookie.SameSite, http.SameSiteNoneMode)
		})
	}
}

func TestHandleCallback(t *testing.T) {
	config.LoadConfig(config.Test)

	lh, closer := mustGetLoginHandler()
	defer closer()
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	server := httptest.NewServer(OauthServerHandlers(t))
	defer server.Close()

	config.Set(config.FrontendApplicationURL, server.URL)
	config.Set(config.AuthCookieDomain, "localhost")

	pm := provider_mock.NewMockIProviderManager(mockCtrl)
	pm.EXPECT().GetOAuthConfig("mock").Return(getMockOauthConfig(server.URL), true).Times(2)
	pm.EXPECT().GetOAuthConfig("invalid").Return(provider.OAuthConfig{}, false).Times(1)
	pm.EXPECT().ExtractUser("mock", gomock.Any(), gomock.Any()).DoAndReturn(
		func(prov string, token *oauth2.Token, jsonInfo []byte) (model.User, error) {
			t_util.AssertStructIsNotEmpty(t, *token)
			t_util.AssertStringNotEquals(t, string(jsonInfo), "")
			return model.User{Email: "test@mail.dev"}, nil
		},
	)
	lh.pm = pm
	testCases := []struct {
		name                string
		provider            string
		state               string
		expectedLocationURL string
		expectedStatus      int
		expectedBody        string
	}{
		{
			name:                "Valid Provider",
			provider:            "mock",
			state:               "statecode",
			expectedLocationURL: server.URL,
			expectedStatus:      http.StatusTemporaryRedirect,
			expectedBody:        "<a href=\"" + server.URL + "\">Temporary Redirect</a>.\n\n",
		},
		{
			name:           "Invalid Provider",
			provider:       "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "{\"code\":400,\"message\":\"Provider not supported\"}",
		},
		{
			name:           "Invalid state",
			provider:       "mock",
			state:          "does not match",
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   "{\"code\":401,\"message\":\"Invalid state\"}",
		},
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ginCtx, _ := gin.CreateTestContext(w)

			code := "code"
			req := t_util.MustRequest(t, "GET", "auth/"+tc.provider+"/callback", nil)
			parameters := url.Values{}
			parameters.Add("state", tc.state)
			parameters.Add("code", code)
			req.URL.RawQuery = parameters.Encode()

			req.AddCookie(&http.Cookie{
				Name:     OauthStateCookieName,
				Value:    "statecode",
				Path:     "/",
				Domain:   "localhost",
				MaxAge:   int(time.Now().Add(1 * time.Hour).Unix()),
				HttpOnly: true,
				Secure:   true,
				SameSite: http.SameSiteNoneMode,
			})
			ginCtx.Request = req
			ginCtx.AddParam("provider", tc.provider)

			lh.HandleCallback(ginCtx)

			resp := w.Result()
			err := resp.Body.Close()
			if err != nil {
				t.Fatalf("Failed to close response body: %v", err)
			}

			t_util.AssertStringEquals(t, w.Body.String(), tc.expectedBody)
			t_util.AssertStatusCode(t, resp.StatusCode, tc.expectedStatus)

			location := resp.Header.Get("Location")
			if !strings.HasPrefix(location, tc.expectedLocationURL) {
				t.Errorf("Expected redirect to %s, got %s", tc.expectedLocationURL, location)
			}

			if tc.expectedStatus != http.StatusTemporaryRedirect {
				return
			}

			oauthStateCookie := findCookie(resp.Cookies(), AuthTokenCookieName)
			if oauthStateCookie == nil {
				t.Fatal("OAuth state cookie not set")
			}

			t_util.AssertNotEquals(t, oauthStateCookie.Value, "")
			t_util.AssertEquals(t, oauthStateCookie.MaxAge, 3600)
			t_util.AssertStringEquals(t, oauthStateCookie.Path, "/")
			t_util.AssertStringEquals(t, oauthStateCookie.Domain, "localhost")
			t_util.AssertTrue(t, oauthStateCookie.HttpOnly)
			t_util.AssertTrue(t, oauthStateCookie.Secure)
			t_util.AssertEquals(t, oauthStateCookie.SameSite, http.SameSiteNoneMode)

			claims, err := ParseToken(oauthStateCookie.Value)
			t_util.AssertNoError(t, err)
			t_util.AssertStructIsNotEmpty(t, claims)
		})
	}
}

func TestHandleLoginUser(t *testing.T) {
	config.LoadConfig(config.Test)
	lh := &LoginHandler{}
	user := model.NewUser("test@mail.dev")
	jwt, err := GenerateJWT(user, 24*time.Hour)
	t_util.RequireNoError(t, err)

	testCases := []struct {
		name           string
		token          string
		expectedStatus int
		expectedBody   string
	}{
		{
			name:           "Valid Token",
			token:          jwt,
			expectedStatus: http.StatusOK,

			expectedBody: fmt.Sprintf(`{"ID":"%s","Name":"","AvatarURL":"","Email":"%s","Organization":""`, user.ID.String(), user.Email),
		},
		{
			name:           "No Token",
			token:          "",
			expectedStatus: http.StatusNoContent,
			expectedBody:   "",
		},
		{
			name:           "Invalid Token",
			token:          "invalid_token",
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   `{"code":401,"message":"Token not valid"}`,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ginCtx, _ := gin.CreateTestContext(w)
			req := t_util.MustRequest(t, "GET", "auth/user", nil)
			req.AddCookie(&http.Cookie{
				Name:     AuthTokenCookieName,
				Value:    tc.token,
				Path:     "/",
				Domain:   "localhost",
				MaxAge:   int(time.Now().Add(1 * time.Hour).Unix()),
				HttpOnly: true,
				Secure:   true,
				SameSite: http.SameSiteNoneMode,
			})
			ginCtx.Request = req

			lh.HandleLoginUser(ginCtx)

			resp := w.Result()
			err := resp.Body.Close()
			if err != nil {
				t.Fatalf("Failed to close response body: %v", err)
			}

			t_util.AssertStatusCode(t, resp.StatusCode, tc.expectedStatus)
			if !strings.HasPrefix(w.Body.String(), tc.expectedBody) {
				t.Errorf("Expected body to be to %s, got %s", w.Body.String(), tc.expectedBody)
			}

			if tc.expectedStatus != http.StatusOK {
				return
			}

		})
	}
}
