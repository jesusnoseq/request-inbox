package dynamo_test

import (
	"context"
	"encoding/json"
	"log"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database/dynamo"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func setupTest() (dynamo.InboxDAO, context.Context) {
	config.LoadConfig(config.Test)
	testTableName := config.GetString(config.DBDynamoName) //fmt.Sprintf("ProvisionTest-%d%s", time.Now().UnixMilli(), uuid.New())
	ctx := context.Background()
	s, err := dynamo.GetSession(ctx)
	if err != nil {
		panic(err)
	}
	dbClient := dynamo.NewDynamoClient(s)
	dao := dynamo.NewInboxDAO(testTableName, dbClient, 5*time.Second)
	//_, err := dynamo.CreateTable(ctx, dbClient, testTableName)
	//assert.NoError(err)
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
			name: "Create inbox",
			in: func() model.Inbox {
				return model.GenerateInbox()
			},
			wantErr: "",
		},
	}
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			inbox := tc.in()
			createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
			// defer func() {
			// 	err := inboxDAO.DeleteInbox(ctx, createdInbox.ID)
			// 	if err != nil {
			// 		t.Errorf("Got an error deleting inbox %s", createdInbox.ID.String())
			// 	}
			// }()

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
	req := model.GenerateRequest(1)
	err = inboxDAO.AddRequestToInbox(ctx, createdInbox.ID, req)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	req = model.GenerateRequest(2)
	err = inboxDAO.AddRequestToInbox(ctx, createdInbox.ID, req)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	inbox, err = inboxDAO.GetInbox(ctx, createdInbox.ID)
	if err != nil {
		t.Errorf("Expected no error but got %s.", err)
	}
	if len(inbox.Requests) != 2 {
		t.Errorf("Expected 2 request but got %d.", len(inbox.Requests))
	}
}

func TestCreateRequest(t *testing.T) {
	inboxDAO, ctx := setupTest()
	inbox := model.GenerateInbox()
	createdInbox, err := inboxDAO.CreateInbox(ctx, inbox)
	if err != nil {
		t.Errorf("Expected no error error but got %s.", err)
	}
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
}

// func TestUpdateOperation(t *testing.T) {
// 	assert := assertlib.New(t)
// 	provisionDAO, ctx := setupTest(assert)
// 	op1 := insertTestingOperation(ctx, assert, provisionDAO,
// 		map[string]string{"from": "x", "to": "y"}, false)
// 	op2 := insertTestingOperation(ctx, assert, provisionDAO,
// 		map[string]string{"from": "a", "to": "b"}, false)

// 	testCases := []struct {
// 		name   string
// 		update func() model.Operation
// 		err    string
// 	}{
// 		{
// 			name: "Set operation to done",
// 			update: func() model.Operation {
// 				op1.Done = true
// 				return op1
// 			},
// 			err: "",
// 		},
// 	}
// 	for _, tc := range testCases {
// 		t.Run(tc.name, func(t *testing.T) {
// 			assert := assertlib.New(t)
// 			expectedUpdate := tc.update()
// 			updatedOp, err := provisionDAO.UpdateOperation(ctx, expectedUpdate)
// 			if tc.err != "" {
// 				assert.NotNil(err)
// 				assert.Regexp(tc.err, err.Error())
// 				return
// 			}
// 			opInBD, err := provisionDAO.GetOperation(ctx, updatedOp.ID)
// 			assert.NoError(err)
// 			assert.NotEmpty(updatedOp.ID)
// 			operationEquals(assert, expectedUpdate, opInBD)
// 		})
// 	}
// }

// func TestDeleteOperation(t *testing.T) {
// 	assert := assertlib.New(t)
// 	provisionDAO, ctx := setupTest(assert)
// 	op1 := insertTestingOperation(ctx, assert, provisionDAO,
// 		map[string]string{"from": "x", "to": "y"}, false)
// 	op2 := insertTestingOperation(ctx, assert, provisionDAO,
// 		map[string]string{"from": "a", "to": "b"}, false)

// 	notFoundUUID := uuid.New()

// 	testCases := []struct {
// 		name string
// 		id   uuid.UUID
// 		err  string
// 	}{
// 		{
// 			name: "Delete one operation",
// 			id:   op1.ID,
// 			err:  "",
// 		},
// 		{
// 			name: "Delete operation that does not exist",
// 			id:   notFoundUUID,
// 			err:  `operation .* not found`,
// 		},
// 	}

// 	for _, tc := range testCases {
// 		t.Run(tc.name, func(t *testing.T) {
// 			assert := assertlib.New(t)
// 			err := provisionDAO.DeleteOperation(ctx, tc.id)
// 			if tc.err != "" {
// 				assert.NotNil(err)
// 				assert.Regexp(tc.err, err.Error())
// 				return
// 			}
// 			assert.NoError(err)
// 			_, err = provisionDAO.GetOperation(ctx, tc.id)
// 			assert.Error(err)

// 			_, err = provisionDAO.GetOperation(ctx, op2.ID)
// 			assert.NoError(err)
// 		})
// 	}
// }

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

// func insertTestingOperation(
// 	ctx context.Context,
// 	assert *assertlib.Assertions,
// 	provisionDAO dynamo.ProvisionDAO,
// 	params interface{},
// 	done bool,
// ) model.Operation {
// 	metadata := model.NewMetadata(model.FMGADOMCopy)
// 	newOp := model.NewOperation(metadata, params)
// 	newOp.Done = done
// 	createdOp, err := provisionDAO.CreateOperation(ctx, newOp)
// 	assert.NoError(err)
// 	return createdOp
// }

func MustMarshallUUID(id uuid.UUID) []byte {
	bin, err := id.MarshalBinary()
	if err != nil {
		log.Panic(err)
	}
	return bin
}
