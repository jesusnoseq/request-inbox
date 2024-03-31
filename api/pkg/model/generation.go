package model

import (
	"crypto/rand"
	"encoding/hex"
	"math"
	"time"

	"github.com/jesusnoseq/request-inbox/pkg/collection"
)

// Generates a Base16 random string
func randomString(l int) string {
	buff := make([]byte, int(math.Ceil(float64(l)/2)))
	_, _ = rand.Read(buff)
	str := hex.EncodeToString(buff)
	return str[:l] // strip 1 extra character we get from odd length results
}

func GenerateInbox() Inbox {
	return Inbox{
		Name:      randomString(10),
		Timestamp: time.Now().UnixMilli(),
		Response: Response{
			Code: 200,
			Body: "response body" + randomString(5),
			Headers: map[string]string{
				"Content-Type":  "application/json; charset=utf-8",
				randomString(5): randomString(5),
			},
		},
		Requests:              []Request{GenerateRequest(1), GenerateRequest(2)},
		ObfuscateHeaderFields: []string{"Authorization"},
	}
}

func GenerateRequest(id int) Request {
	body := "This is the request body." + randomString(10)
	return Request{
		ID:        id,
		Timestamp: time.Now().UnixMilli(),
		Headers: map[string][]string{
			"Content-Type":  {"application/json"},
			"Authorization": {"Bearer access_token"},
		},
		URI:           "http://host:80/a/path?query=param#fragment",
		Body:          body,
		Host:          "localhost:8080",
		Protocol:      "HTTP/1.1",
		ContentLength: int64(len(body)),
		RemoteAddr:    "[::1]:61764",
		Method:        "POST",
	}
}

func CopyInbox(inbox Inbox) Inbox {
	copy := inbox

	copy.Response.Headers = collection.CopySimpleMap(inbox.Response.Headers)

	copy.Requests = make([]Request, len(inbox.Requests))
	for _, req := range inbox.Requests {
		copy.Requests = append(copy.Requests, CopyRequest(req))
	}

	copy.ObfuscateHeaderFields = collection.CopySlice(inbox.ObfuscateHeaderFields)
	return copy
}

func CopyRequest(request Request) Request {
	copy := request
	copy.Headers = collection.CopySliceMap(request.Headers)
	return copy
}
