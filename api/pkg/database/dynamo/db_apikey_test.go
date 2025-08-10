package dynamo_test

import (
	"context"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/collection"
	"github.com/jesusnoseq/request-inbox/pkg/database/dynamo"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func DeleteAPIKey(t *testing.T, dao dynamo.InboxDAO, aPIKeyID uuid.UUID) {
	t.Log("Deleting API key ", aPIKeyID.String())
	t.Helper()
	err := dao.DeleteAPIKey(context.Background(), aPIKeyID)
	if err != nil {
		t.Errorf("Got an error deleting API key %s", aPIKeyID.String())
	}
}

func TestGetAPIKey(t *testing.T) {
	inboxDAO, ctx := setupTest()
	user := model.GenerateUser()
	apiKey := model.GenerateAPIKey(user.ID)
	err := inboxDAO.CreateAPIKey(ctx, apiKey)
	defer DeleteAPIKey(t, inboxDAO, apiKey.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	gotAPIKey, err := inboxDAO.GetAPIKey(ctx, apiKey.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	expectJSONEquals(t, apiKey, gotAPIKey)
}

func TestDeleteAPIkey(t *testing.T) {
	inboxDAO, ctx := setupTest()
	user := model.GenerateUser()
	ak := model.GenerateAPIKey(user.ID)
	err := inboxDAO.CreateAPIKey(ctx, ak)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	err = inboxDAO.DeleteAPIKey(ctx, ak.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	_, err = inboxDAO.GetAPIKey(ctx, ak.ID)
	if err == nil {
		t.Errorf("Expected error but got %s.", err)
	}
	if !strings.HasSuffix(err.Error(), "not found") {
		t.Errorf("Expected not found error but got %s.", err)
	}
}

func TestCreateAPIKey(t *testing.T) {
	inboxDAO, ctx := setupTest()

	user := model.GenerateUser()
	apiKey1 := model.GenerateAPIKey(user.ID)
	err := inboxDAO.CreateAPIKey(ctx, apiKey1)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer DeleteAPIKey(t, inboxDAO, apiKey1.ID)
}

func TestListAPIKeyByUser(t *testing.T) {
	inboxDAO, ctx := setupTest()

	user := model.GenerateUser()
	_, err := inboxDAO.UpsertUser(ctx, user)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer DeleteUser(t, inboxDAO, user.ID)

	otherUser := model.GenerateUser()
	_, err = inboxDAO.UpsertUser(ctx, otherUser)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer DeleteUser(t, inboxDAO, otherUser.ID)

	apiKeyOtherUser := model.GenerateAPIKey(otherUser.ID)
	apiKeyOtherUser.OwnerID = otherUser.ID
	err = inboxDAO.CreateAPIKey(ctx, apiKeyOtherUser)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer DeleteAPIKey(t, inboxDAO, apiKeyOtherUser.ID)

	// List should have 0 items
	allUserAPIKeys, err := inboxDAO.ListAPIKeyByUser(ctx, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allUserAPIKeys) != 0 {
		t.Errorf("Expected len(allUserAPIKeys) to be 0 but got %d.", len(allUserAPIKeys))
	}

	// Create first API key for user
	apiKey1 := model.GenerateAPIKey(user.ID)
	err = inboxDAO.CreateAPIKey(ctx, apiKey1)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer DeleteAPIKey(t, inboxDAO, apiKey1.ID)

	// List should have 1 items
	allUserAPIKeys, err = inboxDAO.ListAPIKeyByUser(ctx, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allUserAPIKeys) != 1 {
		t.Errorf("Expected len(allUserAPIKeys) to be 1 but got %d.", len(allUserAPIKeys))
	}
	if allUserAPIKeys[0].ID != apiKey1.ID {
		t.Errorf("Expected apiKey.ID to be apiKey1.ID %q but got %q.", apiKey1.ID, allUserAPIKeys[0].ID)
	}

	// Create second API key for user
	apiKey2 := model.GenerateAPIKey(user.ID)
	err = inboxDAO.CreateAPIKey(ctx, apiKey2)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer DeleteAPIKey(t, inboxDAO, apiKey2.ID)

	allUserAPIKeys, err = inboxDAO.ListAPIKeyByUser(ctx, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allUserAPIKeys) != 2 {
		t.Errorf("Expected len(allUserAPIKeys) to be 2 but got %d.", len(allUserAPIKeys))
	}

	if !collection.SliceOfAnyContains(allUserAPIKeys, apiKey1, APIKeyEquals) {
		t.Errorf("Expected allUserAPIKeys[*].ID to be createdAPIKey1.ID %q but got %q.", apiKey1.ID, allUserAPIKeys[0].ID)
	}
	if !collection.SliceOfAnyContains(allUserAPIKeys, apiKey2, APIKeyEquals) {
		t.Errorf("Expected allUserAPIKeys[*].ID to be createdAPIKey2.ID %q but got %q.", apiKey2.ID, allUserAPIKeys[1].ID)
	}
}

func APIKeyEquals(a, b model.APIKey) bool {
	return cmp.Equal(a, b)
}
