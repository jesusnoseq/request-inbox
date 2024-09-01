package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type InboxDAO interface {
	CreateInbox(context.Context, model.Inbox) (model.Inbox, error)
	UpdateInbox(context.Context, model.Inbox) (model.Inbox, error)
	GetInbox(context.Context, uuid.UUID) (model.Inbox, error)
	DeleteInbox(context.Context, uuid.UUID) error
	ListInbox(context.Context) ([]model.Inbox, error)
	DeleteInboxRequests(ctx context.Context, ID uuid.UUID) error
	AddRequestToInbox(context.Context, uuid.UUID, model.Request) error
	UpsertUser(context.Context, model.User) error
	Close(context.Context) error
}
