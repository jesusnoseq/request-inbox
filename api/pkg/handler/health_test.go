package handler_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jesusnoseq/request-inbox/pkg/config"
)

func TestInboxHealth(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.DBEngine, config.DBEngineBadger)
	ih, closer := mustGetInboxHandler()
	defer closer()

	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	req, err := http.NewRequest(
		"GET",
		"",
		nil,
	)
	if err != nil {
		t.Error(err)
	}
	ginCtx.Request = req
	ih.Health(ginCtx)
	resp := w.Result()
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected StatusOK, got %v", resp.StatusCode)
	}
	want := `{"embededDB":true,"snapshot":"local","status":"pass","version":"0.2"}`
	if w.Body.String() != want {
		t.Errorf("Expected response %q, got %q", want, w.Body.String())
	}
}
