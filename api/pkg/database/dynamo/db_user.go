package dynamo

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func (d *InboxDAO) UpsertUser(ctx context.Context, user model.User) error {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()
	userItem := toUserItem(user)

	item, err := attributevalue.MarshalMap(userItem)
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

func (d *InboxDAO) GetUser(ctx context.Context, ID uuid.UUID) (model.User, error) {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()

	pk, sk := GenUserKey(ID)
	input := &dynamodb.GetItemInput{
		TableName: aws.String(d.tableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pk},
			"SK": &types.AttributeValueMemberS{Value: sk},
		},
	}

	result, err := d.dbclient.GetItem(ctx, input)
	if err != nil {
		return model.User{}, fmt.Errorf("failed to get item from DynamoDB: %w", err)
	}

	if result.Item == nil {
		return model.User{}, fmt.Errorf("user with ID %s not found", ID.String())
	}

	var userItem UserItem
	err = attributevalue.UnmarshalMap(result.Item, &userItem)
	if err != nil {
		return model.User{}, fmt.Errorf("failed to unmarshal DynamoDB item: %w", err)
	}

	return userItem.User, nil
}

func (d *InboxDAO) DeleteUser(ctx context.Context, ID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()

	pk, sk := GenUserKey(ID)
	key := map[string]types.AttributeValue{
		"PK": &types.AttributeValueMemberS{Value: pk},
		"SK": &types.AttributeValueMemberS{Value: sk},
	}

	input := &dynamodb.DeleteItemInput{
		TableName: aws.String(d.tableName),
		Key:       key,
	}

	_, err := d.dbclient.DeleteItem(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to delete item, %w", err)
	}

	return nil
}
