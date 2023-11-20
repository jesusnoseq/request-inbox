package model

import (
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Inbox struct {
	ID                    uuid.UUID
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
	ID        int
	Timestamp int64
	Path      string
	Headers   map[string][]string
	Body      string
}

func NewInbox() Inbox {
	return Inbox{
		ID:                    uuid.New(),
		Timestamp:             time.Now().UnixMilli(),
		Response:              Response{Code: http.StatusOK, Body: "", Headers: map[string]string{}},
		Requests:              []Request{},
		ObfuscateHeaderFields: []string{},
	}
}
