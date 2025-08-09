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
	GetInboxWithRequests(context.Context, uuid.UUID) (model.Inbox, error)
	DeleteInbox(context.Context, uuid.UUID) error
	ListInbox(context.Context) ([]model.Inbox, error)
	ListInboxByUser(context.Context, uuid.UUID) ([]model.Inbox, error)
	DeleteInboxRequests(ctx context.Context, ID uuid.UUID) error
	AddRequestToInbox(context.Context, uuid.UUID, model.Request) error

	UpsertUser(context.Context, model.User) (bool, error)
	GetUser(context.Context, uuid.UUID) (model.User, error)
	DeleteUser(context.Context, uuid.UUID) error

	CreateAPIKey(context.Context, model.APIKey) error
	GetAPIKey(context.Context, uuid.UUID) (model.APIKey, error)
	ListAPIKeyByUser(context.Context, uuid.UUID) ([]model.APIKey, error)
	DeleteAPIKey(context.Context, uuid.UUID) error

	Close(context.Context) error
}
