package dynamo

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/aws-xray-sdk-go/xray"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database/errors"
	"github.com/jesusnoseq/request-inbox/pkg/database/option"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

const inboxIDAnnotationKey = "InboxID"

type InboxDAO struct {
	tableName string
	dbclient  *dynamodb.Client
	timeout   time.Duration
}

func NewInboxDAO(
	tableName string,
	dbclient *dynamodb.Client,
	defaultTimeout time.Duration,
) *InboxDAO {
	return &InboxDAO{
		tableName: tableName,
		timeout:   defaultTimeout,
		dbclient:  dbclient,
	}
}

func (d *InboxDAO) GetInbox(ctx context.Context, id uuid.UUID) (model.Inbox, error) {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()

	getItemInput := &dynamodb.GetItemInput{
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberB{Value: MustMarshallUUID(id)},
		},
		TableName:            aws.String(d.tableName),
		ConsistentRead:       aws.Bool(true),
		ProjectionExpression: aws.String(inProjectionExpression),
	}
	getItemResponse, err := d.dbclient.GetItem(ctx, getItemInput)
	if err != nil {
		return model.Inbox{}, fmt.Errorf("get inbox failed: %w", err)
	}
	if getItemResponse.Item == nil {
		return model.Inbox{}, fmt.Errorf("%w: %q", errors.ErrNotFound, id)
	}

	opi := InboxItem{}
	err = attributevalue.UnmarshalMap(getItemResponse.Item, &opi)
	if err != nil {
		return model.Inbox{}, fmt.Errorf("unmarshal failed: %w", err)
	}

	return toInboxModel(opi), nil
}

func (d *InboxDAO) CreateInbox(
	ctx context.Context,
	in model.Inbox,
) (model.Inbox, error) {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()
	in.ID = uuid.New()

	inI := toInboxItem(in)
	item, err := attributevalue.MarshalMap(inI)
	if err != nil {
		return in, fmt.Errorf("error marshaling inbox to db: %w", err)
	}

	out, err := d.dbclient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:    aws.String(d.tableName),
		Item:         item,
		ReturnValues: types.ReturnValueAllOld,
	})
	if err != nil {
		return in, err
	}
	createdOp := model.Inbox{}
	err = attributevalue.UnmarshalMap(out.Attributes, &createdOp)
	xray.AddAnnotation(ctx, inboxIDAnnotationKey, in.ID.String())
	return in, err
}

func (d *InboxDAO) UpdateInbox(
	ctx context.Context,
	op model.Inbox,
) (model.Inbox, error) {
	opi := toInboxItem(op)

	// meta, err := attributevalue.MarshalMap(op.Metadata)
	// if err != nil {
	// 	return op, fmt.Errorf("can not marshal metadata: %w", err)
	// }
	// resp, err := attributevalue.MarshalMap(op.Response)
	// if err != nil {
	// 	return op, fmt.Errorf("can not marshal Response: %w", err)
	// }

	attrs := map[string]types.AttributeValue{
		":id": &types.AttributeValueMemberB{Value: MustMarshallUUID(op.ID)},
		// ":meta": &types.AttributeValueMemberM{Value: meta},
		// ":resp": &types.AttributeValueMemberM{Value: resp},
		// ":done": &types.AttributeValueMemberBOOL{Value: opi.Done},
	}
	updateExpr := inUpdateExpresion

	// if op.Error != nil {
	// 	erro, marshalErr := attributevalue.MarshalMap(op.Error)
	// 	if marshalErr != nil {
	// 		return op, fmt.Errorf("can not marshal error: %w", marshalErr)
	// 	}
	// 	attrs[":erro"] = &types.AttributeValueMemberM{Value: erro}
	// 	updateExpr = opUpdateExpresionWithErr
	// }

	_, err := d.dbclient.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(d.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberB{Value: MustMarshallUUID(opi.ID)},
		},
		ConditionExpression:       aws.String(inUpdateConditionExpresion),
		UpdateExpression:          aws.String(updateExpr),
		ExpressionAttributeValues: attrs,
		ReturnValues:              types.ReturnValueAllNew,
	})

	if err != nil {
		return op, fmt.Errorf("error updating inbox: %w", err)
	}

	return op, nil
}

func (d *InboxDAO) ListInboxs(
	ctx context.Context,
	options ...option.ListInboxOption,
) ([]model.Inbox, error) {
	opts := &option.ListInboxOptions{
		Projection: nil,
	}
	for _, option := range options {
		option(opts)
	}

	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()
	out, err := d.dbclient.Scan(ctx, &dynamodb.ScanInput{
		TableName:            aws.String(d.tableName),
		ProjectionExpression: opts.Projection,
	})
	if err != nil {
		return nil, err
	}
	items := make([]InboxItem, out.Count)
	ops := make([]model.Inbox, out.Count)
	err = attributevalue.UnmarshalListOfMaps(out.Items, &items)
	for i, item := range items {
		ops[i] = toInboxModel(item)
	}
	return ops, err
}

func (d *InboxDAO) DeleteInbox(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()

	out, err := d.dbclient.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(d.tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberB{Value: MustMarshallUUID(id)},
		},
		ReturnValues: types.ReturnValueAllOld,
	})

	if err != nil {
		return fmt.Errorf("error deleting inbox: %w", err)
	}

	if len(out.Attributes) == 0 {
		return fmt.Errorf("inbox %q not found", id)
	}

	return nil
}

func MustMarshallUUID(id uuid.UUID) []byte {
	bin, err := id.MarshalBinary()
	if err != nil {
		log.Panic(err)
	}
	return bin
}
