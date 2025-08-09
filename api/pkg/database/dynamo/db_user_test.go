package dynamo_test

import (
	"context"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database/dynamo"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func DeleteUser(t *testing.T, dao dynamo.InboxDAO, userID uuid.UUID) {
	t.Log("Deleting user ", userID.String())
	t.Helper()
	err := dao.DeleteUser(context.Background(), userID)
	if err != nil {
		t.Errorf("Got an error deleting user %s", userID.String())
	}
}

func TestUpsertUser(t *testing.T) {
	inboxDAO, ctx := setupTest()
	t.Run("Create user", func(t *testing.T) {
		user := model.GenerateUser()
		isNewUser, err := inboxDAO.UpsertUser(ctx, user)
		defer DeleteUser(t, inboxDAO, user.ID)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		if !isNewUser {
			t.Errorf("Expected new user to be true but got false")
		}
		user.Name = "other name"
		isNewUser, err = inboxDAO.UpsertUser(ctx, user)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		if isNewUser {
			t.Errorf("Expected new user to be false but got true")
		}
		gotUser, err := inboxDAO.GetUser(ctx, user.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}
		expectJSONEquals(t, user, gotUser)

		user.Provider = model.GenerateUserProvider()
		_, err = inboxDAO.UpsertUser(ctx, user)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		gotUser, err = inboxDAO.GetUser(ctx, user.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}
		expectJSONEquals(t, user, gotUser)
	})
}

func TestGetUser(t *testing.T) {
	inboxDAO, ctx := setupTest()
	user := model.GenerateUserWithProvider()
	_, err := inboxDAO.UpsertUser(ctx, user)
	defer DeleteUser(t, inboxDAO, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	gotUser, err := inboxDAO.GetUser(ctx, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	expectJSONEquals(t, user, gotUser)
}

func TestDeleteUser(t *testing.T) {
	inboxDAO, ctx := setupTest()
	user := model.GenerateUserWithProvider()
	_, err := inboxDAO.UpsertUser(ctx, user)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	err = inboxDAO.DeleteUser(ctx, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	_, err = inboxDAO.GetUser(ctx, user.ID)
	if err == nil {
		t.Errorf("Expected error but got %s.", err)
	}
	if !strings.HasSuffix(err.Error(), "not found") {
		t.Errorf("Expected not found error but got %s.", err)
	}
}
