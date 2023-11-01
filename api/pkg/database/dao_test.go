package database_test

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"math"
	"testing"
	"time"

	"github.com/google/go-cmp/cmp"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
	"github.com/jesusnoseq/request-inbox/pkg/database/embedded"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type closer func(context.Context)

func MustGetDB() (database.InboxDAO, closer) {
	config.LoadConfig(config.Test)
	db, err := embedded.NewInboxDB("", true)
	if err != nil {
		panic(err)
	}
	return db, func(ctx context.Context) {
		db.Close(ctx)
	}
}

func MustCreateInbox(ctx context.Context, db database.InboxDAO, inbox model.Inbox) model.Inbox {
	created, err := db.CreateInbox(ctx, inbox)
	if err != nil {
		panic(err)
	}
	return created
}

// Generates a Base16 random string
func randomString(l int) string {
	buff := make([]byte, int(math.Ceil(float64(l)/2)))
	rand.Read(buff)
	str := hex.EncodeToString(buff)
	return str[:l] // strip 1 extra character we get from odd length results
}

func GenerateInbox() model.Inbox {
	return model.Inbox{
		Timestamp: time.Now().UnixMilli(),
		Response: model.Response{
			ResponseBody:    "response body" + randomString(5),
			ResponseHeaders: map[string]string{randomString(5): randomString(5)},
		},
		Requests:              []model.Request{GenerateRequest(1), GenerateRequest(2)},
		ObfuscateHeaderFields: []string{"Authorization"},
	}
}

func GenerateRequest(id int) model.Request {
	return model.Request{
		ID:        id,
		Timestamp: time.Now().UnixMilli(),
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"Authorization": "Bearer access_token" + randomString(5),
		},
		Body: "This is the request body." + randomString(10),
	}
}

func TestCreateInbox(t *testing.T) {
	ctx := context.Background()
	db, close := MustGetDB()
	defer close(ctx)
	inbox := GenerateInbox()
	created, err := db.CreateInbox(ctx, inbox)
	if err != nil {
		t.Errorf("expected no error. Got %v", err)
	}
	inboxWithID := inbox
	inboxWithID.ID = created.ID
	if diff := cmp.Diff(inboxWithID, created); diff != "" {
		t.Errorf("GetInboxDAO(ctx, inbox) = created, want inboxWithID. Diff: %s", diff)
	}
}

func TestGetInbox(t *testing.T) {
	ctx := context.Background()
	db, close := MustGetDB()
	defer close(ctx)
	inDBInbox := MustCreateInbox(ctx, db, GenerateInbox())
	notInDBInbox := GenerateInbox()
	notInDBInbox.ID = uuid.New()
	empty := model.Inbox{}

	testCases := []struct {
		desc        string
		id          uuid.UUID
		want        model.Inbox
		expectedErr bool
	}{
		{desc: "Existing ID", id: inDBInbox.ID, want: inDBInbox, expectedErr: false},
		{desc: "Not existing ID", id: notInDBInbox.ID, want: empty, expectedErr: true},
		{desc: "Empty ID", id: uuid.Nil, want: empty, expectedErr: true},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			got, err := db.GetInbox(context.Background(), tc.id)
			if tc.expectedErr {
				if err == nil {
					t.Errorf("Expected an error but got nil.")
				}
			} else {
				if err != nil {
					t.Errorf("Expected no error, but got an error: %v", err)
				}
			}
			if diff := cmp.Diff(tc.want, got); diff != "" {
				t.Errorf("GetInbox(ctx, %v) = got, want tc.want. Diff: %s", tc.id, diff)
			}
		})
	}
}

func TestListInbox(t *testing.T) {
	ctx := context.Background()
	db, close := MustGetDB()
	defer close(ctx)
	emptyList := []model.Inbox{}
	t.Run("List inbox with no items", func(t *testing.T) {
		list, err := db.ListInbox(ctx)
		if err != nil {
			t.Errorf("Expected no error, but got an error: %v", err)
		}
		if diff := cmp.Diff(emptyList, list); diff != "" {
			t.Errorf("Expected emptyList, but got items: %v", diff)
		}
	})
	t.Run("List inbox with one item", func(t *testing.T) {
		newInbox := MustCreateInbox(ctx, db, GenerateInbox())
		list, err := db.ListInbox(ctx)
		if err != nil {
			t.Errorf("Expected no error, but got an error: %v", err)
		}
		if diff := cmp.Diff([]model.Inbox{newInbox}, list); diff != "" {
			t.Errorf("Expected emptyList, but got items: %v", diff)
		}
	})
}

func TestUpdateInbox(t *testing.T) {
	ctx := context.Background()
	db, close := MustGetDB()
	defer close(ctx)
	inDBInbox := MustCreateInbox(ctx, db, GenerateInbox())
	modDBInbox := GenerateInbox()
	modDBInbox.ID = inDBInbox.ID
	newInbox := GenerateInbox()
	t.Run("Modify item that exists", func(t *testing.T) {
		got, err := db.UpdateInbox(ctx, modDBInbox)
		if err != nil {
			t.Errorf("Expected no error, but got an error: %v", err)
		}
		if diff := cmp.Diff(modDBInbox, got); diff != "" {
			t.Errorf("Expected modDBInbox, but got items: %v", diff)
		}
		got, err = db.GetInbox(ctx, inDBInbox.ID)
		if err != nil {
			t.Errorf("Expected no error, but got an error: %v", err)
		}
		if diff := cmp.Diff(modDBInbox, got); diff != "" {
			t.Errorf("Expected modDBInbox, but got items: %v", diff)
		}
	})
	t.Run("Modify item that does not exists creates a new one", func(t *testing.T) {
		got, err := db.UpdateInbox(ctx, newInbox)
		if err != nil {
			t.Errorf("Expected no error, but got an error: %v", err)
		}
		if diff := cmp.Diff(newInbox, got); diff != "" {
			t.Errorf("Expected newInbox, but got items: %v", diff)
		}
	})
}

func TestDeleteInbox(t *testing.T) {
	ctx := context.Background()
	db, close := MustGetDB()
	defer close(ctx)
	inDBInbox := MustCreateInbox(ctx, db, GenerateInbox())
	notInDBInbox := GenerateInbox()
	notInDBInbox.ID = uuid.New()
	empty := model.Inbox{}

	testCases := []struct {
		desc        string
		id          uuid.UUID
		expectedErr bool
	}{
		{desc: "Delete existing ID", id: inDBInbox.ID, expectedErr: false},
		{desc: "Delete not existing ID", id: notInDBInbox.ID, expectedErr: false},
		{desc: "Delete empty ID", id: uuid.Nil, expectedErr: false},
	}

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			err := db.DeleteInbox(context.Background(), tc.id)
			if tc.expectedErr && err == nil {
				t.Errorf("Expected an error but got nil.")
			} else if !tc.expectedErr && err != nil {
				t.Errorf("Expected no error, but got an error: %v", err)
			}
			got, err := db.GetInbox(context.Background(), tc.id)
			if !cmp.Equal(got, empty) {
				t.Errorf("Expected empty inbox but got %+v", got)
			}
			if err == nil {
				t.Errorf("Expected an error but got nil.")
			}
		})
	}
}

func TestClose(t *testing.T) {
	ctx := context.Background()
	db, _ := MustGetDB()
	t.Run("Close DB", func(t *testing.T) {
		err := db.Close(ctx)
		if err != nil {
			t.Errorf("Expected no error, but got an error: %v", err)
		}
	})
	t.Run("Try a query when DB is closed", func(t *testing.T) {
		_, err := db.ListInbox(ctx)
		if err == nil {
			t.Errorf("Expected an error but got nil.")
		}
	})
	t.Run("Close DB multiple times does not produce errors", func(t *testing.T) {
		if err := db.Close(ctx); err != nil {
			t.Errorf("Expected no error, but got an error: %v", err)
		}
	})
}
