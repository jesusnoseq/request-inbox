package route_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/jesusnoseq/request-inbox/pkg/handler/handler_mock"
	"github.com/jesusnoseq/request-inbox/pkg/login/login_mock"
	"github.com/jesusnoseq/request-inbox/pkg/route"
)

func TestSetInboxRoutes(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	r := gin.New()
	ih := handler_mock.NewMockIInboxHandler(mockCtrl)
	returnOk := func(c *gin.Context) {
		c.Status(http.StatusOK)
	}
	ih.EXPECT().ListInbox(gomock.Any()).Do(returnOk).Times(1)
	ih.EXPECT().CreateInbox(gomock.Any()).Do(returnOk).Times(1)
	ih.EXPECT().DeleteInbox(gomock.Any()).Do(returnOk).Times(1)
	ih.EXPECT().GetInbox(gomock.Any()).Do(returnOk).Times(1)
	ih.EXPECT().UpdateInbox(gomock.Any()).Do(returnOk).Times(1)
	ih.EXPECT().DeleteInboxRequests(gomock.Any()).Do(returnOk).Times(1)
	ih.EXPECT().RegisterInboxRequest(gomock.Any()).Do(returnOk).Times(2)
	ih.EXPECT().Health(gomock.Any()).Do(returnOk).Times(1)

	route.SetInboxRoutes(r, ih)
	route.SetUtilityRoutes(r, ih)

	testCases := []struct {
		desc      string
		method    string
		path      string
		expectErr bool
	}{
		{"list inbox path", http.MethodGet, "/api/v1/inboxes", false},
		{"create inbox path", http.MethodPost, "/api/v1/inboxes", false},
		{"get inbox detail path", http.MethodGet, "/api/v1/inboxes/123", false},
		{"update inbox detail", http.MethodPut, "/api/v1/inboxes/123", false},
		{"delete inbox detail", http.MethodDelete, "/api/v1/inboxes/123", false},
		{"delete inbox requests", http.MethodDelete, "/api/v1/inboxes/123/requests", false},
		{"make request to the inbox", http.MethodTrace, "/api/v1/inboxes/111/in", false},
		{"make request to the inbox with more complex path", http.MethodPost, "/api/v1/inboxes/222/in/some/path", false},
		{"get health", http.MethodGet, "/api/v1/health", false},
		{"not defined route", http.MethodPost, "/notdefined", true},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			req, err := http.NewRequest(tc.method, tc.path, nil)
			if err != nil {
				t.Fatal(err)
			}
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if !tc.expectErr && w.Code != http.StatusOK {
				t.Errorf("Expected status code %d, but got %d", http.StatusOK, w.Code)
			}
			if tc.expectErr && w.Code != http.StatusNotFound {
				t.Errorf("Expected status code %d, but got %d", http.StatusNotFound, w.Code)
			}
		})
	}
}

func TestSetUserRoutes(t *testing.T) {
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()
	r := gin.New()
	lh := login_mock.NewMockILoginHandler(mockCtrl)
	returnOk := func(c *gin.Context) {
		c.Status(http.StatusOK)
	}

	lh.EXPECT().HandleLogin(gomock.Any()).Do(returnOk).Times(2)
	lh.EXPECT().HandleCallback(gomock.Any()).Do(returnOk).Times(2)
	lh.EXPECT().HandleLoginUser(gomock.Any()).Do(returnOk).Times(1)
	lh.EXPECT().HandleLogout(gomock.Any()).Do(returnOk).Times(1)

	route.SetLoginRoutes(r, lh)

	testCases := []struct {
		desc      string
		method    string
		path      string
		expectErr bool
	}{
		{"login github path", http.MethodGet, "/api/v1/auth/github/login", false},
		{"login google path", http.MethodGet, "/api/v1/auth/google/login", false},
		{"callback github path", http.MethodGet, "/api/v1/auth/github/callback", false},
		{"callback google path", http.MethodGet, "/api/v1/auth/google/callback", false},
		{"logout", http.MethodGet, "/api/v1/auth/user", false},
		{"get user", http.MethodGet, "/api/v1/auth/logout", false},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			req, err := http.NewRequest(tc.method, tc.path, nil)
			if err != nil {
				t.Fatal(err)
			}
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if !tc.expectErr && w.Code != http.StatusOK {
				t.Errorf("Expected status code %d, but got %d", http.StatusOK, w.Code)
			}
			if tc.expectErr && w.Code != http.StatusNotFound {
				t.Errorf("Expected status code %d, but got %d", http.StatusNotFound, w.Code)
			}
		})
	}
}
