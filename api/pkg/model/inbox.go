package model

import (
	"net/http"
	"time"

	"github.com/google/uuid"
)

const (
	ContentTypeHeader        = "Content-Type"
	DefaultContentTypeHeader = "application/json; charset=utf-8"
	DefaultBody              = "{}"
	InboxEntityName          = "Inbox"
)

type Inbox struct {
	ID                    uuid.UUID
	Name                  string    `dynamodbav:"alias"`
	Timestamp             int64     `dynamodbav:"unixTimestamp"`
	Response              Response  `dynamodbav:"resp"`
	Requests              []Request `dynamodbav:"req"`
	ObfuscateHeaderFields []string  `dynamodbav:"ofuscate"`
	OwnerID               uuid.UUID `dynamodbav:"OwnerID"`
	IsPrivate             bool      `dynamodbav:"IsPrivate"`
}

type Response struct {
	Code         int
	CodeTemplate string
	Body         string
	Headers      map[string]string
	IsDynamic    bool
}

type Request struct {
	ID            int
	Timestamp     int64 `dynamodbav:"unixTimestamp"`
	URI           string
	Host          string
	RemoteAddr    string
	Protocol      string
	Headers       map[string][]string
	Method        string `dynamodbav:"httpMethod"`
	ContentLength int64
	Body          string
}

func NewInbox() Inbox {
	id := uuid.New()
	return Inbox{
		ID:        id,
		Name:      id.String(),
		Timestamp: time.Now().UnixMilli(),
		Response: Response{
			Code:    http.StatusOK,
			Headers: map[string]string{ContentTypeHeader: DefaultContentTypeHeader},
			Body:    DefaultBody,
		},
		Requests:              []Request{},
		ObfuscateHeaderFields: []string{},
		IsPrivate:             false,
		OwnerID:               uuid.UUID{},
	}
}
