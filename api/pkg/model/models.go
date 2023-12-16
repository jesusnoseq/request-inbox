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
)

type Inbox struct {
	ID                    uuid.UUID
	Name                  string
	Timestamp             int64
	Response              Response
	Requests              []Request
	ObfuscateHeaderFields []string
}

type Response struct {
	Code    int
	Body    string
	Headers map[string]string
}

type Request struct {
	ID            int
	Timestamp     int64
	URI           string
	Host          string
	RemoteAddr    string
	Protocol      string
	Headers       map[string][]string
	Method        string
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
	}
}
