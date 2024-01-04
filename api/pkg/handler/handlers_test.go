package handler_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/go-cmp/cmp"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/collection"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/handler"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type closer func()

func mustGetInboxHandler() (*handler.InboxHandler, closer) {
	ctx := context.Background()
	dao, err := database.GetInboxDAO(ctx, database.Badger)
	if err != nil {
		panic(err)
	}
	return handler.NewInboxHandler(dao), func() {
		dao.Close(ctx)
	}
}

func mustJson(payload any) []byte {
	b, err := json.Marshal(payload)
	if err != nil {
		panic(err)
	}
	return b
}

func mustParseInbox(payload []byte) model.Inbox {
	i := model.Inbox{}
	err := json.Unmarshal(payload, &i)
	if err != nil {
		panic(err)
	}
	return i
}

func mustParseInboxList(payload []byte) model.ItemList[model.Inbox] {
	il := model.ItemList[model.Inbox]{}
	err := json.Unmarshal(payload, &il)
	if err != nil {
		panic(err)
	}
	return il
}

func isUUID(id string) bool {
	_, err := uuid.Parse(id)
	return err == nil
}

func shoudlExistsInbox(ih *handler.InboxHandler, i model.Inbox) model.Inbox {
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	body := mustJson(i)
	req, err := http.NewRequest(
		"POST",
		"",
		bytes.NewReader(body),
	)
	if err != nil {
		panic(err)
	}
	ginCtx.Request = req
	ih.CreateInbox(ginCtx)
	resp := w.Result()
	resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		panic("inbox should be created")
	}
	return mustParseInbox(w.Body.Bytes())
}

func TestCreateInbox(t *testing.T) {
	config.LoadConfig(config.Test)
	inbox := model.GenerateInbox()
	body := mustJson(inbox)
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	req, err := http.NewRequest(
		"POST",
		"",
		bytes.NewReader(body),
	)
	if err != nil {
		t.Error(err)
	}

	ginCtx.Request = req

	ih, closer := mustGetInboxHandler()
	defer closer()
	ih.CreateInbox(ginCtx)

	resp := w.Result()
	resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected StatusCreated, got %v with body %s", resp.StatusCode, w.Body.String())
	}
	newInbox := mustParseInbox(w.Body.Bytes())
	inbox.ID = newInbox.ID
	inbox.Timestamp = newInbox.Timestamp
	inbox.Name = inbox.ID.String()
	if !isUUID(newInbox.ID.String()) {
		t.Errorf("Expected valid UUID, got %v", newInbox.ID)
	}
	if newInbox.Timestamp <= 0 {
		t.Errorf("Expected Timestamp to be > 0: got  %v", newInbox.Timestamp)
	}
	if diff := cmp.Diff(newInbox, inbox); diff != "" {
		t.Errorf("Diff(newInbox, inbox) = %v, expected to be equals", diff)
	}
}

func TestListInbox(t *testing.T) {
	config.LoadConfig(config.Test)
	ih, closer := mustGetInboxHandler()
	defer closer()
	inboxA := shoudlExistsInbox(ih, model.GenerateInbox())
	inboxB := shoudlExistsInbox(ih, model.GenerateInbox())
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
	ih.ListInbox(ginCtx)
	resp := w.Result()
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected StatusOK, got %v", resp.StatusCode)
	}
	inboxList := mustParseInboxList(w.Body.Bytes())

	if !collection.SliceOfAnyContains(inboxList.Results, inboxA, InboxEquals) {
		t.Errorf("inboxList does not contains inboxA %v", inboxA)
	}
	if !collection.SliceOfAnyContains(inboxList.Results, inboxB, InboxEquals) {
		t.Errorf("inboxList does not contains inboxB %v", inboxB)
	}
}

func InboxEquals(a any, b any) bool {
	return cmp.Equal(a, b)
}

func TestDeleteInbox(t *testing.T) {
	config.LoadConfig(config.Test)
	ih, closer := mustGetInboxHandler()
	defer closer()
	inbox := shoudlExistsInbox(ih, model.GenerateInbox())

	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", inbox.ID.String())
	req, err := http.NewRequest(
		"DELETE",
		"",
		nil,
	)
	if err != nil {
		t.Error(err)
	}
	ginCtx.Request = req
	ih.DeleteInbox(ginCtx)
	resp := w.Result()
	resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("Expected StatusNoContent, got %v with body %s", resp.StatusCode, w.Body.String())
	}
}

func TestGetInbox(t *testing.T) {
	config.LoadConfig(config.Test)
	ih, closer := mustGetInboxHandler()
	defer closer()
	inbox := model.GenerateInbox()
	inbox = shoudlExistsInbox(ih, inbox)

	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", inbox.ID.String())
	req, err := http.NewRequest(
		"GET",
		"",
		nil,
	)
	if err != nil {
		t.Error(err)
	}
	ginCtx.Request = req
	ih.GetInbox(ginCtx)
	resp := w.Result()
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected StatusOK, got %v with body %s", resp.StatusCode, w.Body.String())
	}
	queryInbox := mustParseInbox(w.Body.Bytes())

	if !isUUID(queryInbox.ID.String()) {
		t.Errorf("Expected valid UUID, got %v", queryInbox.ID)
	}
	if queryInbox.Timestamp <= 0 {
		t.Errorf("Expected valid Timestamp, got %v", queryInbox.Timestamp)
	}
	if diff := cmp.Diff(queryInbox, inbox); diff != "" {
		t.Errorf("Diff(queryInbox, inbox) = %v, expected to be equals", diff)
	}
}

func TestUpdateInbox(t *testing.T) {
	config.LoadConfig(config.Test)
	ih, closer := mustGetInboxHandler()
	defer closer()
	inbox := model.GenerateInbox()
	inbox = shoudlExistsInbox(ih, inbox)

	modInbox := model.GenerateInbox()
	modInbox.ID = inbox.ID
	modInbox.Timestamp = inbox.Timestamp
	modInbox.Requests = inbox.Requests
	body := mustJson(modInbox)
	req, err := http.NewRequest(
		"PUT",
		"",
		bytes.NewReader(body),
	)
	if err != nil {
		t.Error(err)
	}
	w := httptest.NewRecorder()
	ginCtx, _ := gin.CreateTestContext(w)
	ginCtx.AddParam("id", inbox.ID.String())
	ginCtx.Request = req
	ih.UpdateInbox(ginCtx)
	resp := w.Result()
	resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected StatusOK, got %v with body %s", resp.StatusCode, w.Body.String())
	}
	updatedInbox := mustParseInbox(w.Body.Bytes())
	if !isUUID(updatedInbox.ID.String()) {
		t.Errorf("Expected valid UUID, got %v", updatedInbox.ID)
	}
	if updatedInbox.Timestamp <= 0 {
		t.Errorf("Expected valid Timestamp, got %v", updatedInbox.Timestamp)
	}
	if diff := cmp.Diff(updatedInbox, modInbox); diff != "" {
		t.Errorf("Diff(updatedInbox, modInbox) = %v, expected to be equals", diff)
	}

	w = httptest.NewRecorder()
	ginCtx, _ = gin.CreateTestContext(w)
	ginCtx.AddParam("id", inbox.ID.String())
	req, err = http.NewRequest(
		"GET",
		"",
		nil,
	)
	if err != nil {
		t.Error(err)
	}
	ginCtx.Request = req
	ih.GetInbox(ginCtx)
	resp = w.Result()
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected StatusOK, got %v with body %s", resp.StatusCode, w.Body.String())
	}
	getedInbox := mustParseInbox(w.Body.Bytes())
	if diff := cmp.Diff(updatedInbox, getedInbox); diff != "" {
		t.Errorf("Diff(updatedInbox, getedInbox) = %v, expected to be equals", diff)
	}
}

func TestInboxHealth(t *testing.T) {
	config.LoadConfig(config.Test)
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
	if w.Body.String() != `{"embededDB":true,"status":"pass","version":"0.1"}` {
		t.Errorf("Expected response ...., got %v", w.Body.String())
	}
}
