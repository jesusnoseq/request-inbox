package embedded

import (
	"context"
	"fmt"
	"time"

	badger "github.com/dgraph-io/badger/v4"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

const inboxPrefix = "inbox#"
const userPrefix = "user#"
const apiKeyPrefix = "apiKey#"

type InboxBadger struct {
	db *badger.DB
}

func NewInboxDB(path string, memoryOnly bool) (*InboxBadger, error) {
	db, err := badger.Open(badger.DefaultOptions(path).WithInMemory(memoryOnly))
	if err != nil {
		return nil, fmt.Errorf("error opening badger DB: %w", err)
	}

	return &InboxBadger{
		db: db,
	}, nil
}

func (ib *InboxBadger) Close(ctx context.Context) error {
	if ib == nil {
		return nil
	}
	err := ib.db.Close()
	if err != nil {
		return fmt.Errorf("error closing badger DB: %w", err)
	}
	return nil
}

func (ib *InboxBadger) getInboxKey(id uuid.UUID) []byte {
	return append([]byte(inboxPrefix), id[:]...)
}

func (ib *InboxBadger) getUserKey(id uuid.UUID) []byte {
	return append([]byte(userPrefix), id[:]...)
}

func (ib *InboxBadger) getAPIKeyKey(id uuid.UUID) []byte {
	return append([]byte(apiKeyPrefix), id[:]...)
}

func (ib *InboxBadger) CreateInbox(ctx context.Context, inbox model.Inbox) (model.Inbox, error) {
	inbox.ID = uuid.New()
	inbox.Name = inbox.ID.String()
	inbox.Timestamp = time.Now().UnixMilli()
	data, err := encode(inbox)
	if err != nil {
		return model.Inbox{}, err
	}
	e := badger.NewEntry(ib.getInboxKey(inbox.ID), data)
	err = ib.db.Update(func(txn *badger.Txn) error {
		return txn.SetEntry(e)
	})
	if err != nil {
		return inbox, err
	}
	return inbox, nil
}

func (ib *InboxBadger) UpdateInbox(ctx context.Context, inbox model.Inbox) (model.Inbox, error) {
	data, err := encode(inbox)
	if err != nil {
		return inbox, err
	}

	err = ib.db.Update(func(txn *badger.Txn) error {
		return txn.Set(ib.getInboxKey(inbox.ID), data)
	})
	return inbox, err
}

func (ib *InboxBadger) AddRequestToInbox(ctx context.Context, ID uuid.UUID, req model.Request) error {
	inbox, err := ib.GetInboxWithRequests(ctx, ID)
	if err != nil {
		return err
	}
	inbox.Requests = append(inbox.Requests, req)
	_, err = ib.UpdateInbox(ctx, inbox)
	return err
}

func (ib *InboxBadger) GetInboxWithRequests(ctx context.Context, ID uuid.UUID) (model.Inbox, error) {
	var valCopy []byte
	err := ib.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(ib.getInboxKey(ID))
		if err != nil {
			return err
		}
		err = item.Value(func(val []byte) error {
			valCopy = append([]byte{}, val...)
			return nil
		})
		return err
	})
	if err != nil {
		return model.Inbox{}, err
	}
	return decode[model.Inbox](valCopy)
}

func (ib *InboxBadger) GetInbox(ctx context.Context, ID uuid.UUID) (model.Inbox, error) {
	return ib.GetInboxWithRequests(ctx, ID)
}

func (ib *InboxBadger) DeleteInbox(ctx context.Context, ID uuid.UUID) error {
	err := ib.db.Update(func(txn *badger.Txn) error {
		return txn.Delete(ib.getInboxKey(ID))
	})
	if err != nil {
		return fmt.Errorf("error deleting %v: %w", ID, err)
	}
	return nil
}

func (ib *InboxBadger) DeleteInboxRequests(ctx context.Context, ID uuid.UUID) error {
	inbox, err := ib.GetInboxWithRequests(ctx, ID)
	if err != nil {
		return err
	}
	inbox.Requests = []model.Request{}
	_, err = ib.UpdateInbox(ctx, inbox)
	if err != nil {
		return fmt.Errorf("error deleting request of inbox %v: %w", ID, err)
	}
	return nil
}

func (ib *InboxBadger) ListInbox(ctx context.Context) ([]model.Inbox, error) {
	return ib.listInbox(ctx, func(i model.Inbox) bool {
		return true
	})
}

func (ib *InboxBadger) ListInboxByUser(ctx context.Context, userID uuid.UUID) ([]model.Inbox, error) {
	return ib.listInbox(ctx, func(i model.Inbox) bool {
		return i.OwnerID == userID
	})
}

func (ib *InboxBadger) listInbox(ctx context.Context, filter func(model.Inbox) bool) ([]model.Inbox, error) {
	inboxList := []model.Inbox{}
	err := ib.db.View(func(txn *badger.Txn) error {
		it := txn.NewIterator(badger.DefaultIteratorOptions)
		defer it.Close()
		prefix := []byte(inboxPrefix)
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			item := it.Item()
			err := item.Value(func(val []byte) error {
				valCopy := append([]byte{}, val...)
				inbox, err := decode[model.Inbox](valCopy)
				if err != nil {
					return err
				}
				if filter(inbox) {
					inboxList = append(inboxList, inbox)
				}
				return nil
			})
			if err != nil {
				return err
			}
		}
		return nil
	})
	return inboxList, err
}

func (ib *InboxBadger) UpsertUser(ctx context.Context, user model.User) error {
	data, err := encode(user)
	if err != nil {
		return err
	}

	err = ib.db.Update(func(txn *badger.Txn) error {
		return txn.Set(ib.getUserKey(user.ID), data)
	})
	return err
}

func (ib *InboxBadger) DeleteUser(ctx context.Context, ID uuid.UUID) error {
	err := ib.db.Update(func(txn *badger.Txn) error {
		return txn.Delete(ib.getUserKey(ID))
	})
	if err != nil {
		return fmt.Errorf("error deleting %v: %w", ID, err)
	}
	return nil
}

func (ib *InboxBadger) GetUser(ctx context.Context, ID uuid.UUID) (model.User, error) {
	var valCopy []byte
	err := ib.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(ib.getUserKey(ID))
		if err != nil {
			return err
		}
		err = item.Value(func(val []byte) error {
			valCopy = append([]byte{}, val...)
			return nil
		})
		return err
	})
	if err != nil {
		return model.User{}, err
	}
	return decode[model.User](valCopy)
}

func (ib *InboxBadger) CreateAPIKey(ctx context.Context, apiKey model.APIKey) error {
	data, err := encode(apiKey)
	if err != nil {
		return err
	}

	e := badger.NewEntry(ib.getAPIKeyKey(apiKey.ID), data)
	err = ib.db.Update(func(txn *badger.Txn) error {
		return txn.SetEntry(e)
	})
	return err
}

func (ib *InboxBadger) GetAPIKey(ctx context.Context, apiKeyID uuid.UUID) (model.APIKey, error) {
	var valCopy []byte
	err := ib.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(ib.getAPIKeyKey(apiKeyID))
		if err != nil {
			return err
		}
		err = item.Value(func(val []byte) error {
			valCopy = append([]byte{}, val...)
			return nil
		})
		return err
	})
	if err != nil {
		return model.APIKey{}, err
	}

	return decode[model.APIKey](valCopy)
}

func (ib *InboxBadger) ListAPIKeyByUser(ctx context.Context, userID uuid.UUID) ([]model.APIKey, error) {
	var apiKeys []model.APIKey
	prefix := []byte(apiKeyPrefix)

	err := ib.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.PrefetchValues = true
		it := txn.NewIterator(opts)
		defer it.Close()

		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			item := it.Item()
			var valCopy []byte
			err := item.Value(func(val []byte) error {
				valCopy = append([]byte{}, val...)
				return nil
			})
			if err != nil {
				return err
			}

			apiKey, err := decode[model.APIKey](valCopy)
			if err != nil {
				return err
			}
			if apiKey.OwnerID == userID {
				apiKeys = append(apiKeys, apiKey)
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	return apiKeys, nil
}

func (ib *InboxBadger) DeleteAPIKey(ctx context.Context, apiKeyID uuid.UUID) error {
	err := ib.db.Update(func(txn *badger.Txn) error {
		return txn.Delete(ib.getAPIKeyKey(apiKeyID))
	})
	if err != nil {
		return fmt.Errorf("error deleting API key %v: %w", apiKeyID, err)
	}
	return nil
}
