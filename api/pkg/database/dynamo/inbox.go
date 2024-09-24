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
	OwnerIndex                 = "OWNER_INDEX"
)

type InboxItem struct {
	PK    string      `dynamodbav:"PK"`
	SK    string      `dynamodbav:"SK"`
	OWNER string      `dynamodbav:"OWNER_ID"`
	Inbox model.Inbox `dynamodbav:"doc"`
}

type RequestItem struct {
	PK      string        `dynamodbav:"PK"`
	SK      string        `dynamodbav:"SK"`
	Request model.Request `dynamodbav:"doc"`
}

type UserItem struct {
	PK    string     `dynamodbav:"PK"`
	SK    string     `dynamodbav:"SK"`
	OWNER string     `dynamodbav:"OWNER_ID"`
	User  model.User `dynamodbav:"doc"`
}

const InboxKey = "INBOX"
const RequestKey = "REQUEST"
const UserKey = "USER"
const OWNERKey = "OWNER_ID"
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
	owner := UserKey + KS + uuid.Nil.String()
	if in.OwnerID != uuid.Nil {
		owner = UserKey + KS + in.OwnerID.String()
	}
	return InboxItem{
		PK:    pk,
		SK:    sk,
		OWNER: owner,
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

func toUserItem(user model.User) UserItem {
	pk, sk := GenUserKey(user.ID)
	return UserItem{
		PK:    pk,
		SK:    sk,
		OWNER: user.ID.String(),
		User:  user,
	}
}
