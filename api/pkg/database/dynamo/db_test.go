package dynamo_test

import (
	"context"
	"encoding/json"
	"errors"
	"log"
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
			defer func() {
				err := inboxDAO.DeleteInbox(ctx, createdInbox.ID)
				if err != nil {
					t.Errorf("Got an error deleting inbox %s", createdInbox.ID.String())
				}
			}()

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
	defer func() {
		err := inboxDAO.DeleteInbox(ctx, createdInbox1.ID)
		if err != nil {
			t.Errorf("Got an error deleting inbox %s", createdInbox1.ID.String())
		}
	}()

	createdInbox2, err := inboxDAO.CreateInbox(ctx, model.GenerateInbox())
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
	defer func() {
		err := inboxDAO.DeleteInbox(ctx, createdInbox2.ID)
		if err != nil {
			t.Errorf("Got an error deleting inbox %s", createdInbox2.ID.String())
		}
	}()

	allInboxes, err = inboxDAO.ListInbox(ctx)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(allInboxes) != 2 {
		t.Errorf("Expected len(allInboxes) to be 2 but got %d.", len(allInboxes))
	}
}

func TestGetInbox(t *testing.T) {
	inboxDAO, ctx := setupTest()
	inbox := model.GenerateInbox()
	createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	defer func() {
		err := inboxDAO.DeleteInbox(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Got an error deleting inbox %s", createdInbox.ID.String())
		}
	}()
	gotInbox, err := inboxDAO.GetInbox(ctx, createdInbox.ID)
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
	time.Sleep(5 * time.Second)
	gotInbox, err := inboxDAO.GetInbox(ctx, createdInbox.ID)
	if err != dberrors.ErrItemNotFound {
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
	defer func() {
		err := inboxDAO.DeleteInbox(ctx, createdInbox.ID)
		if err != nil {
			t.Errorf("Got an error deleting inbox %s", createdInbox.ID.String())
		}
	}()

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
	inbox, err = inboxDAO.GetInbox(ctx, createdInbox.ID)
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

		gotInbox, err := inboxDAO.GetInbox(ctx, createdInbox.ID)
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

		gotInbox, err := inboxDAO.GetInbox(ctx, createdInbox.ID)
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

func TestUpdateInbox(t *testing.T) {
	inboxDAO, ctx := setupTest()
	t.Run("Inbox without request", func(t *testing.T) {
		inbox := model.GenerateInbox()
		createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		defer func() {
			err := inboxDAO.DeleteInbox(ctx, createdInbox.ID)
			if err != nil {
				t.Errorf("Got an error deleting inbox %s", createdInbox.ID.String())
			}
		}()
		createdInbox.Name = "Something else"
		createdInbox.Response.Body = "changed body"
		_, err = inboxDAO.UpdateInbox(ctx, createdInbox)
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		updatedInbox, err := inboxDAO.GetInbox(ctx, createdInbox.ID)
		updatedInbox.Requests = []model.Request{}
		createdInbox.Requests = []model.Request{}
		if err != nil {
			t.Errorf("Expected no error error but got %s.", err)
		}
		expectJSONEquals(t, createdInbox, updatedInbox)
	})
}

func expectJSONEquals(t *testing.T, a, b model.Inbox) {
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
