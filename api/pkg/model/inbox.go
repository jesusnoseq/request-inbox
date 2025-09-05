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
	Name                  string      `dynamodbav:"alias"`
	Timestamp             int64       `dynamodbav:"unixTimestamp"`
	Response              Response    `dynamodbav:"resp"`
	Requests              []Request   `dynamodbav:"req"`
	ObfuscateHeaderFields []string    `dynamodbav:"ofuscate"`
	OwnerID               uuid.UUID   `dynamodbav:"OwnerID"`
	IsPrivate             bool        `dynamodbav:"IsPrivate"`
	PassThrough           PassThrough `dynamodbav:"PassThrough"`
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

type PassThrough struct {
	Enabled   bool              `dynamodbav:"enabled"`
	IsDynamic bool              `dynamodbav:"isDynamic"`
	PrefixURL string            `dynamodbav:"prefixURL"`
	ToURL     string            `dynamodbav:"toURL"`
	Method    string            `dynamodbav:"method"`
	Headers   map[string]string `dynamodbav:"headers"`
	Body      string            `dynamodbav:"body"`
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

func NewPassThrough() PassThrough {
	return PassThrough{
		Enabled:   false,
		IsDynamic: false,
		Method:    "",
		ToURL:     "",
		PrefixURL: "",
		Headers:   map[string]string{},
		Body:      "",
	}
}
