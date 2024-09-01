package dynamo

import (
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

const (
	inProjectionExpression     = "PK, SK, doc"
	inUpdateExpresion          = "set doc=:doc"
	inUpdateConditionExpresion = "PK= :PK AND SK= :SK"
)

type InboxItem struct {
	PK    string      `dynamodbav:"PK"`
	SK    string      `dynamodbav:"SK"`
	Inbox model.Inbox `dynamodbav:"doc"`
}

type RequestItem struct {
	PK      string        `dynamodbav:"PK"`
	SK      string        `dynamodbav:"SK"`
	Request model.Request `dynamodbav:"doc"`
}

const InboxKey = "INBOX"
const RequestKey = "REQUEST"
const UserKey = "USER"
const KS = "#" // Key Separator

func GenUserKey(id uuid.UUID) (string, string) {
	return UserKey + KS + id.String(), UserKey
}

func IsUserSK(sk string) bool {
	return strings.HasPrefix(sk, UserKey)
}

func GenInboxKey(id uuid.UUID) (string, string) {
	return InboxKey + KS + id.String(), InboxKey
}

func GenRequestKey(id uuid.UUID) (string, string) {
	return InboxKey + KS + id.String(), RequestKey + KS + strconv.FormatInt(time.Now().UnixMilli(), 10)
}

func toInboxModel(inI InboxItem) model.Inbox {
	return inI.Inbox
}

func isInboxSK(sk string) bool {
	return strings.HasPrefix(sk, InboxKey)
}

func isRequestSK(sk string) bool {
	return strings.HasPrefix(sk, RequestKey)
}

func toInboxItem(in model.Inbox) InboxItem {
	pk, sk := GenInboxKey(in.ID)
	in.Requests = []model.Request{}
	return InboxItem{
		PK:    pk,
		SK:    sk,
		Inbox: in,
	}
}

func toRequestItem(id uuid.UUID, req model.Request) RequestItem {
	pk, sk := GenRequestKey(id)
	return RequestItem{
		PK:      pk,
		SK:      sk,
		Request: req,
	}
}
