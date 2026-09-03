package route_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/route"
)

func TestSetMCPRoute(t *testing.T) {
	router := gin.New()
	route.SetMCPRoute(router, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/mcp" {
			t.Fatalf("got path %q", r.URL.Path)
		}
		w.WriteHeader(http.StatusAccepted)
	}))

	request := httptest.NewRequest(http.MethodPost, "/mcp", nil)
	response := httptest.NewRecorder()
	router.ServeHTTP(response, request)
	if response.Code != http.StatusAccepted {
		t.Fatalf("got status %d, want %d", response.Code, http.StatusAccepted)
	}
}
