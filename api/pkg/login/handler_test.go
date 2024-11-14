package login

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

func TestHandleLogout(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	lh := &LoginHandler{}

	lh.HandleLogout(c)

	resp := w.Result()
	resp.Body.Close()
	t_util.AssertStatusCode(t, resp.StatusCode, http.StatusOK)
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
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
