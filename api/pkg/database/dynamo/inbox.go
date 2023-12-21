package dynamo

import (
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

const (
	inProjectionExpression     = "id, done, metadata, in_error, in_response"
	inUpdateExpresionWithErr   = "set metadata=:meta, in_error=:erro, done=:done, in_response=:resp"
	inUpdateExpresion          = "set metadata=:meta, done=:done, in_response=:resp"
	inUpdateConditionExpresion = "id= :id"
)

type InboxItem struct {
	ID uuid.UUID `dynamodbav:"id"`
}

func toInboxModel(inI InboxItem) model.Inbox {
	return model.Inbox{
		ID: inI.ID,
	}
}

func toInboxItem(op model.Inbox) InboxItem {
	return InboxItem{
		ID: op.ID,
	}
}
