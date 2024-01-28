package dynamo

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database/dberrors"
	"github.com/jesusnoseq/request-inbox/pkg/database/option"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

//const inboxIDAnnotationKey = "InboxID"

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
	pk, _ := GenInboxKey(id)
	getItemInput := &dynamodb.QueryInput{
		TableName:              aws.String(d.tableName),
		ConsistentRead:         aws.Bool(true),
		KeyConditionExpression: aws.String("PK = :PK"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":PK": &types.AttributeValueMemberS{Value: pk},
		},
	}
	getItemResponse, err := d.dbclient.Query(ctx, getItemInput)
	if err != nil {
		return model.Inbox{}, fmt.Errorf("get inbox failed: %w", err)
	}
	if getItemResponse.Items == nil || getItemResponse.Count == 0 {
		return model.Inbox{}, dberrors.ErrItemNotFound
	}
	in := InboxItem{}
	requests := []model.Request{}
	for _, item := range getItemResponse.Items {
		sk := item["SK"].(*types.AttributeValueMemberS).Value
		if strings.HasPrefix(sk, InboxKey) {
			err = attributevalue.UnmarshalMap(item, &in)
			if err != nil {
				return model.Inbox{}, fmt.Errorf("unmarshal inbox failed: %w", err)
			}
		} else if strings.HasPrefix(sk, RequestKey) {
			requestItem := RequestItem{}
			err = attributevalue.UnmarshalMap(item, &requestItem)
			if err != nil {
				return model.Inbox{}, fmt.Errorf("unmarshal request failed: %w", err)
			}
			requests = append(requests, requestItem.Request)
		}
	}
	in.Inbox.Requests = requests

	return toInboxModel(in), nil
}

func (d *InboxDAO) CreateInbox(
	ctx context.Context,
	in model.Inbox,
) (model.Inbox, error) {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()
	in.ID = uuid.New()
	in.Requests = []model.Request{}

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
	//xray.AddAnnotation(ctx, inboxIDAnnotationKey, in.ID.String())
	return in, err
}

func (d *InboxDAO) AddRequestToInbox(ctx context.Context, id uuid.UUID, req model.Request) error {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()
	reqItem := toRequestItem(id, req)

	item, err := attributevalue.MarshalMap(reqItem)
	if err != nil {
		return fmt.Errorf("error marshaling request to db: %w", err)
	}

	_, err = d.dbclient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:    aws.String(d.tableName),
		Item:         item,
		ReturnValues: types.ReturnValueAllOld,
	})
	if err != nil {
		return err
	}
	return err
}

func (d *InboxDAO) Close(context.Context) error {
	return nil
}

func (d *InboxDAO) UpdateInbox(
	ctx context.Context,
	in model.Inbox,
) (model.Inbox, error) {
	in.Requests = []model.Request{}
	inboxAttr, err := attributevalue.MarshalMap(in)
	if err != nil {
		return in, fmt.Errorf("can not marshal inbox: %w", err)
	}
	pk, sk := GenInboxKey(in.ID)
	attrs := map[string]types.AttributeValue{
		":PK":  &types.AttributeValueMemberS{Value: pk},
		":SK":  &types.AttributeValueMemberS{Value: sk},
		":doc": &types.AttributeValueMemberM{Value: inboxAttr},
	}

	_, err = d.dbclient.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName: aws.String(d.tableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pk},
			"SK": &types.AttributeValueMemberS{Value: sk},
		},
		ConditionExpression:       aws.String(inUpdateConditionExpresion),
		UpdateExpression:          aws.String(inUpdateExpresion),
		ExpressionAttributeValues: attrs,
		ReturnValues:              types.ReturnValueAllNew,
	})
	if err != nil {
		return in, fmt.Errorf("error updating inbox: %w", err)
	}

	return in, nil
}

func (d *InboxDAO) ListInbox(
	ctx context.Context,
	//	options ...option.ListInboxOption,
) ([]model.Inbox, error) {
	options := []option.ListInboxOption{}
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
		FilterExpression:     aws.String("begins_with(SK, :SK)"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":SK": &types.AttributeValueMemberS{Value: InboxKey},
		},
	})
	if err != nil {
		return nil, err
	}
	items := make([]InboxItem, out.Count)
	inboxes := make([]model.Inbox, out.Count)
	err = attributevalue.UnmarshalListOfMaps(out.Items, &items)
	for i, item := range items {
		inboxes[i] = toInboxModel(item)
	}
	return inboxes, err
}

func (d *InboxDAO) DeleteInbox(ctx context.Context, id uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()
	pk, _ := GenInboxKey(id)

	query, err := d.dbclient.Query(ctx, &dynamodb.QueryInput{
		TableName: aws.String(d.tableName),
		KeyConditions: map[string]types.Condition{
			"PK": {
				ComparisonOperator: types.ComparisonOperatorEq,
				AttributeValueList: []types.AttributeValue{
					&types.AttributeValueMemberS{Value: pk},
				},
			},
		},
	})
	if err != nil {
		return fmt.Errorf("error deleting inbox(query): %w", err)
	}
	if query.Count == 0 {
		return dberrors.ErrItemNotFound
	}
	deleteRequests := []types.WriteRequest{}
	for _, item := range query.Items {
		deleteRequests = append(deleteRequests, types.WriteRequest{
			DeleteRequest: &types.DeleteRequest{Key: map[string]types.AttributeValue{
				"PK": item["PK"],
				"SK": item["SK"],
			}},
		})
	}

	_, err = d.dbclient.BatchWriteItem(ctx, &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]types.WriteRequest{
			d.tableName: deleteRequests,
		},
	})

	if err != nil {
		return fmt.Errorf("error deleting inbox: %w", err)
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
