package embedded

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"

	badger "github.com/dgraph-io/badger/v4"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

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

func (ib *InboxBadger) CreateInbox(ctx context.Context, inbox model.Inbox) (model.Inbox, error) {
	inbox.ID = uuid.New()
	data, err := encode(inbox)
	if err != nil {
		return model.Inbox{}, err
	}
	e := badger.NewEntry(inbox.ID[:], data)
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
		return txn.Set(inbox.ID[:], data)
	})
	return inbox, err
}

func (ib *InboxBadger) GetInbox(ctx context.Context, ID uuid.UUID) (model.Inbox, error) {
	var valCopy []byte
	err := ib.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get(ID[:])
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
	return decode(valCopy)
}

func (ib *InboxBadger) DeleteInbox(ctx context.Context, ID uuid.UUID) error {
	err := ib.db.Update(func(txn *badger.Txn) error {
		return txn.Delete(ID[:])
	})
	if err != nil {
		return fmt.Errorf("error deleting %v: %w", ID, err)
	}
	return nil
}

func (ib *InboxBadger) ListInbox(context.Context) ([]model.Inbox, error) {
	inboxList := []model.Inbox{}
	err := ib.db.View(func(txn *badger.Txn) error {
		it := txn.NewIterator(badger.DefaultIteratorOptions)
		defer it.Close()
		prefix := []byte("")
		for it.Seek(prefix); it.ValidForPrefix(prefix); it.Next() {
			item := it.Item()
			k := item.Key()
			err := item.Value(func(val []byte) error {
				fmt.Printf("key=%s, value=%s\n", k, val)
				valCopy := append([]byte{}, val...)
				inbox, err := decode(valCopy)
				if err != nil {
					return err
				}
				inboxList = append(inboxList, inbox)
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

func encode(inbox model.Inbox) ([]byte, error) {
	var buffer bytes.Buffer
	encoder := gob.NewEncoder(&buffer)
	err := encoder.Encode(inbox)
	if err != nil {
		return nil, err
	}
	return buffer.Bytes(), nil
}

func decode(b []byte) (model.Inbox, error) {
	decoder := gob.NewDecoder(bytes.NewReader(b))
	var inbox model.Inbox
	err := decoder.Decode(&inbox)
	if err != nil {
		return model.Inbox{}, fmt.Errorf("error decoding inbox: %w", err)
	}
	return inbox, nil
}
