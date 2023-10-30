package model

import "github.com/google/uuid"

type Inbox struct {
	ID                    uuid.UUID
	Timestamp             int64
	Response              Response
	Requests              []Request
	ObfuscateHeaderFields []string
}

type Response struct {
	ResponseBody    string
	ResponseHeaders map[string]string
}

type Request struct {
	ID        int
	Timestamp int64
	Headers   map[string]string
	Body      string
}
