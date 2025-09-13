package model

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/collection"
)

func randomString(l int) (string, error) {
	buff := make([]byte, int(math.Ceil(float64(l)/2)))
	_, err := rand.Read(buff)
	if err != nil {
		return "", err
	}
	str := hex.EncodeToString(buff)
	return str[:l], nil // strip 1 extra character we get from odd length results
}

func mustRandomString(l int) string {
	r, err := randomString(l)
	if err != nil {
		log.Fatal("error generating random string", err)
	}
	return r
}

func GenerateInbox() Inbox {
	return Inbox{
		ID:        uuid.New(),
		Name:      mustRandomString(10),
		Timestamp: time.Now().UnixMilli(),
		Response: Response{
			Code:         200,
			CodeTemplate: "200",
			Body:         "response body" + mustRandomString(5),
			Headers: map[string]string{
				"Content-Type":      "application/json; charset=utf-8",
				mustRandomString(5): mustRandomString(5),
			},
			IsDynamic: false,
		},
		Requests:              []Request{GenerateRequest(1), GenerateRequest(2)},
		ObfuscateHeaderFields: []string{"Authorization"},
		Callback: []Callback{
			{
				IsEnabled: true,
				IsDynamic: false,
				ToURL:     "http://example.com/webhook",
				Method:    "POST",
				Headers: map[string]string{
					"Content-Type": "application/json",
				},
				Body: `{"event": "request_received"}`,
			},
		},
		OwnerID:   uuid.Nil,
		IsPrivate: false,
	}
}

func GenerateInboxWithOwner() Inbox {
	inbox := GenerateInbox()
	inbox.OwnerID = uuid.New()
	return inbox
}

func GenerateRequest(id int) Request {
	body := "This is the request body." + mustRandomString(10)
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
		CallbackResponses: []CallbackResponse{
			{
				Code:         200,
				CodeTemplate: "200",
				Body:         "callback response " + mustRandomString(5),
				Headers: map[string]string{
					"Content-Type": "application/json",
				},
				IsDynamic: false,
			},
		},
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
	copy.Callback = collection.CopySlice(inbox.Callback)
	return copy
}

func CopyRequest(request Request) Request {
	copy := request
	copy.Headers = collection.CopySliceMap(request.Headers)
	copy.CallbackResponses = collection.CopySlice(copy.CallbackResponses)
	return copy
}

func GenerateUser() User {
	email := fmt.Sprintf("%s@%s.com", mustRandomString(5), mustRandomString(5))
	user := NewUser(email)
	user.Name = mustRandomString(5)
	user.Organization = mustRandomString(5)
	return user
}

func GenerateUserProvider() UserProvider {
	return UserProvider{
		Provider:     "github",
		Username:     mustRandomString(5),
		AccessToken:  mustRandomString(16),
		RefreshToken: mustRandomString(16),
	}
}

func GenerateUserWithProvider() User {
	u := GenerateUser()
	u.Provider = GenerateUserProvider()
	return u
}

func GenerateAPIKey(userID uuid.UUID) APIKey {
	ak, err := NewAPIKey(userID)
	if err != nil {
		panic(err)
	}
	ak.Name = "Generated API key"
	return ak
}
