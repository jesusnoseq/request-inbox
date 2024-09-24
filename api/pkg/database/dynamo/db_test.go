package dynamo_test

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"strings"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database/dberrors"
	"github.com/jesusnoseq/request-inbox/pkg/database/dynamo"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func setupTest() (dynamo.InboxDAO, context.Context) {
	config.LoadConfig(config.Test)
	// TODO
	// Because the table has indexes and configuration that I don't want to duplicate
	// I pre-created it in order save the creation of this table from tests
	//_, err := dynamo.CreateTable(ctx, dbClient, testTableName)
	testTableName := "request-inbox-test" //config.GetString(config.DBDynamoName)
	ctx := context.Background()
	s, err := dynamo.GetSession(ctx)
	if err != nil {
		panic(err)
	}
	dbClient := dynamo.NewDynamoClient(s)
	dao := dynamo.NewInboxDAO(testTableName, dbClient, 5*time.Second)

	return *dao, ctx
}

func TestCreateInbox(t *testing.T) {
	inboxDAO, ctx := setupTest()

	testCases := []struct {
		name    string
		in      func() model.Inbox
		wantErr string
	}{
		{
			name: "Create empty inbox",
			in: func() model.Inbox {
				return model.NewInbox()
			},
			wantErr: "",
		}, {
			name: "Create inbox with data",
			in: func() model.Inbox {
				inbox := model.GenerateInbox()
				inbox.Requests = []model.Request{}
				return inbox
			},
			wantErr: "",
		},
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			inbox := tc.in()
			createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
			defer deleteInbox(t, inboxDAO, createdInbox.ID)

			if err != nil && tc.wantErr != "" {
				if err.Error() == tc.wantErr {
					return
				} else {
					t.Errorf("Expected error %s but got %s.", tc.wantErr, err.Error())
				}
			} else if err == nil && tc.wantErr != "" {
				t.Errorf("Expected an error but got nil.")
			} else if err != nil && tc.wantErr == "" {
				t.Errorf("Expected no error but got %s.", err)
			}
			var emptyUUID uuid.UUID
			if createdInbox.ID == emptyUUID {
				t.Errorf("Expected createdInbox.ID to have a value")
			}
			if inbox.Name == inbox.ID.String() {
				inbox.Name = createdInbox.ID.String()
			}
			inbox.ID = createdInbox.ID
			expectJSONEquals(t, inbox, createdInbox)
		})
	}
}

func TestListInbox(t *testing.T) {
	inboxDAO, ctx := setupTest()

	allInboxes, err := inboxDAO.ListInbox(ctx)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allInboxes) != 0 {
		t.Errorf("Expected len(allInboxes) to be 0 but got %d.", len(allInboxes))
	}
	createdInbox1, err := inboxDAO.CreateInbox(ctx, model.GenerateInbox())
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	defer deleteInbox(t, inboxDAO, createdInbox1.ID)

	createdInbox2, err := inboxDAO.CreateInbox(ctx, model.GenerateInbox())
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	inboxDAO.AddRequestToInbox(ctx, createdInbox2.ID, model.GenerateRequest(0))
	defer deleteInbox(t, inboxDAO, createdInbox2.ID)

	allInboxes, err = inboxDAO.ListInbox(ctx)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allInboxes) != 2 {
		t.Errorf("Expected len(allInboxes) to be 2 but got %d.", len(allInboxes))
	}
	if len(allInboxes[1].Requests) != 0 {
		t.Errorf("Expected len(Requests) to be 0 but got %d.", len(allInboxes))
	}
}

func TestGetInboxWithRequests(t *testing.T) {
	inboxDAO, ctx := setupTest()
	inbox := model.GenerateInbox()
	createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer deleteInbox(t, inboxDAO, createdInbox.ID)
	gotInbox, err := inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	expectJSONEquals(t, createdInbox, gotInbox)
}

func TestGetInboxAfterDelete(t *testing.T) {
	inboxDAO, ctx := setupTest()
	inbox := model.GenerateInbox()
	createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	err = inboxDAO.DeleteInbox(ctx, createdInbox.ID)
	if err != nil {
		t.Errorf("Got an error deleting inbox %s", createdInbox.ID.String())
	}
	gotInbox, err := inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
	if err != dberrors.ErrItemNotFound {
		t.Errorf("Expected %s error but got %s.", dberrors.ErrItemNotFound, err)
	}

	expectJSONEquals(t, gotInbox, model.Inbox{})
}

func TestGetInboxWithRequestsThatDoesNotExists(t *testing.T) {
	inboxDAO, ctx := setupTest()
	gotInbox, err := inboxDAO.GetInboxWithRequests(ctx, uuid.New())
	if !errors.Is(err, dberrors.ErrItemNotFound) {
		t.Errorf("Expected %s error but got %s.", dberrors.ErrItemNotFound, err)
	}
	expectJSONEquals(t, gotInbox, model.Inbox{})
}

func TestGetInboxThatDoesNotExists(t *testing.T) {
	inboxDAO, ctx := setupTest()
	gotInbox, err := inboxDAO.GetInbox(ctx, uuid.New())
	if !errors.Is(err, dberrors.ErrItemNotFound) {
		t.Errorf("Expected %s error but got %s.", dberrors.ErrItemNotFound, err)
	}
	expectJSONEquals(t, gotInbox, model.Inbox{})
}

func TestCreateInboxAndAddRequests(t *testing.T) {
	inboxDAO, ctx := setupTest()
	inbox := model.GenerateInbox()
	inbox.Requests = []model.Request{}
	createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	defer deleteInbox(t, inboxDAO, createdInbox.ID)

	req := model.GenerateRequest(1)
	err = inboxDAO.AddRequestToInbox(ctx, createdInbox.ID, req)
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	req = model.GenerateRequest(2)
	err = inboxDAO.AddRequestToInbox(ctx, createdInbox.ID, req)
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	inbox, err = inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(inbox.Requests) != 2 {
		t.Errorf("Expected 2 request but got %d.", len(inbox.Requests))
	}
}

func TestDeleteInbox(t *testing.T) {
	inboxDAO, ctx := setupTest()
	t.Run("Inbox without request", func(t *testing.T) {
		inbox := model.GenerateInbox()
		inbox.Requests = []model.Request{}
		createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}

		err = inboxDAO.DeleteInbox(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}

		gotInbox, err := inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
		if !errors.Is(err, dberrors.ErrItemNotFound) {
			t.Errorf("Expected ErrItemNotFound error but got %s.", err)
		}
		expectJSONEquals(t, gotInbox, model.Inbox{})
	})
	t.Run("Inbox with requests", func(t *testing.T) {
		inbox := model.GenerateInbox()
		createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}

		err = inboxDAO.DeleteInbox(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}

		gotInbox, err := inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
		if !errors.Is(err, dberrors.ErrItemNotFound) {
			t.Errorf("Expected ErrItemNotFound error but got %s.", err)
		}
		expectJSONEquals(t, gotInbox, model.Inbox{})
	})
	t.Run("Inbox that does not exists", func(t *testing.T) {
		notFoundUUID := uuid.New()
		err := inboxDAO.DeleteInbox(ctx, notFoundUUID)
		if !errors.Is(err, dberrors.ErrItemNotFound) {
			t.Errorf("Expected ErrItemNotFound error but got %s.", err)
		}
	})
}

func TestDeleteInboxRequests(t *testing.T) {
	inboxDAO, ctx := setupTest()
	t.Run("Delete request of inbox without request", func(t *testing.T) {
		inbox := model.GenerateInbox()
		inbox.Requests = []model.Request{}
		createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		defer deleteInbox(t, inboxDAO, createdInbox.ID)
		t.Log("Deleting inbox request of ", createdInbox.ID.String())
		err = inboxDAO.DeleteInboxRequests(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}

		gotInbox, err := inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}
		if len(gotInbox.Requests) != 0 {
			t.Errorf("Expected 0 request but got %d.", len(gotInbox.Requests))
		}
	})
	t.Run("Inbox with requests", func(t *testing.T) {
		inbox := model.GenerateInbox()
		createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		defer deleteInbox(t, inboxDAO, createdInbox.ID)
		err = inboxDAO.AddRequestToInbox(ctx, createdInbox.ID, model.GenerateRequest(1))
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		err = inboxDAO.AddRequestToInbox(ctx, createdInbox.ID, model.GenerateRequest(2))
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}

		err = inboxDAO.DeleteInboxRequests(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}

		gotInbox, err := inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}
		if len(gotInbox.Requests) != 0 {
			t.Errorf("Expected 0 request but got %d.", len(inbox.Requests))
		}
	})
	t.Run("Inbox that does not exists", func(t *testing.T) {
		notFoundUUID := uuid.New()
		err := inboxDAO.DeleteInboxRequests(ctx, notFoundUUID)
		if !errors.Is(err, dberrors.ErrItemNotFound) {
			t.Errorf("Expected ErrItemNotFound error but got %s.", err)
		}
	})

}

func TestUpdateInbox(t *testing.T) {
	inboxDAO, ctx := setupTest()
	t.Run("Inbox without request", func(t *testing.T) {
		inbox := model.GenerateInbox()
		createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		defer deleteInbox(t, inboxDAO, createdInbox.ID)
		createdInbox.Name = "Something else"
		createdInbox.Response.Body = "changed body"
		_, err = inboxDAO.UpdateInbox(ctx, createdInbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		updatedInbox, err := inboxDAO.GetInboxWithRequests(ctx, createdInbox.ID)
		updatedInbox.Requests = []model.Request{}
		createdInbox.Requests = []model.Request{}
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		expectJSONEquals(t, createdInbox, updatedInbox)
	})
}

func deleteInbox(t *testing.T, dao dynamo.InboxDAO, inboxId uuid.UUID) {
	t.Log("Deleting inbox ", inboxId.String())
	t.Helper()
	err := dao.DeleteInbox(context.Background(), inboxId)
	if err != nil {
		t.Errorf("Got an error deleting inbox %s", inboxId.String())
	}
}

func TestUpsertUser(t *testing.T) {
	inboxDAO, ctx := setupTest()
	t.Run("Create user", func(t *testing.T) {
		user := model.GenerateUser()
		err := inboxDAO.UpsertUser(ctx, user)
		defer inboxDAO.DeleteUser(ctx, user.ID)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		user.Name = "other name"
		err = inboxDAO.UpsertUser(ctx, user)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		gotUser, err := inboxDAO.GetUser(ctx, user.ID)
		if err != nil {
			t.Errorf("Expected no error but got %s.", err)
		}
		expectJSONEquals(t, user, gotUser)

		user.Provider = model.GenerateUserProvider()
		err = inboxDAO.UpsertUser(ctx, user)
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
	err := inboxDAO.UpsertUser(ctx, user)
	defer inboxDAO.DeleteUser(ctx, user.ID)
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
	err := inboxDAO.UpsertUser(ctx, user)
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

func TestGetInbox(t *testing.T) {
	inboxDAO, ctx := setupTest()
	createdInbox, err := inboxDAO.CreateInbox(ctx, model.GenerateInbox())
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	defer deleteInbox(t, inboxDAO, createdInbox.ID)
	err = inboxDAO.AddRequestToInbox(ctx, createdInbox.ID, model.GenerateRequest(0))
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	gotInbox, err := inboxDAO.GetInbox(ctx, createdInbox.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(gotInbox.Requests) != 0 {
		t.Errorf("Expected 0 request but got %d.", len(gotInbox.Requests))
	}
	expectJSONEquals(t, createdInbox, gotInbox)

}

func TestListInboxByUser(t *testing.T) {
	inboxDAO, ctx := setupTest()

	user := model.GenerateUser()
	err := inboxDAO.UpsertUser(ctx, user)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer inboxDAO.DeleteUser(ctx, user.ID)

	allUserInboxes, err := inboxDAO.ListInboxByUser(ctx, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allUserInboxes) != 0 {
		t.Errorf("Expected len(allInboxes) to be 0 but got %d.", len(allUserInboxes))
	}
	createdInbox1, err := inboxDAO.CreateInbox(ctx, model.GenerateInbox())
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	defer deleteInbox(t, inboxDAO, createdInbox1.ID)
	inboxDAO.AddRequestToInbox(ctx, createdInbox1.ID, model.GenerateRequest(0))

	inbox2 := model.GenerateInbox()
	inbox2.OwnerID = user.ID
	createdInbox2, err := inboxDAO.CreateInbox(ctx, inbox2)
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	defer deleteInbox(t, inboxDAO, createdInbox2.ID)
	inboxDAO.AddRequestToInbox(ctx, createdInbox2.ID, model.GenerateRequest(0))

	allUserInboxes, err = inboxDAO.ListInboxByUser(ctx, user.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allUserInboxes) != 1 {
		t.Errorf("Expected len(allInboxes) to be 1 but got %d.", len(allUserInboxes))
	}
	if allUserInboxes[0].ID != createdInbox2.ID {
		t.Errorf("Expected inbox.ID to be inbox2.ID %q but got %q.", inbox2.ID, allUserInboxes[0].ID)
	}
	if len(allUserInboxes[0].Requests) != 0 {
		t.Errorf("Expected len(Requests) to be 0 but got %d.", len(allUserInboxes[0].Requests))
	}
}

func expectJSONEquals[T any](t *testing.T, a, b T) {
	t.Helper()
	jsonA, err := json.Marshal(a)
	if err != nil {
		t.Errorf("expected no error. Got %v", err)
	}
	jsonB, err := json.Marshal(b)
	if err != nil {
		t.Errorf("expected no error. Got %v", err)
	}

	if !cmp.Equal(a, b) {
		t.Errorf("Expected equals. Diff: %s", cmp.Diff(jsonA, jsonB))
	}
}

func MustMarshallUUID(id uuid.UUID) []byte {
	bin, err := id.MarshalBinary()
	if err != nil {
		log.Panic(err)
	}
	return bin
}
