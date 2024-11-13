package dynamo

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/database/dberrors"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

func (d *InboxDAO) GetAPIKey(ctx context.Context, ID uuid.UUID) (model.APIKey, error) {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()

	pk, sk := GenAPIKeyKey(ID)
	input := &dynamodb.GetItemInput{
		TableName: aws.String(d.tableName),
		Key: map[string]types.AttributeValue{
			"PK": &types.AttributeValueMemberS{Value: pk},
			"SK": &types.AttributeValueMemberS{Value: sk},
		},
	}

	result, err := d.dbclient.GetItem(ctx, input)
	if err != nil {
		return model.APIKey{}, fmt.Errorf("failed to get item from DynamoDB: %w", err)
	}

	if result.Item == nil {
		return model.APIKey{}, dberrors.ErrItemNotFound
	}

	var apiKeyItem APIKeyItem
	err = attributevalue.UnmarshalMap(result.Item, &apiKeyItem)
	if err != nil {
		return model.APIKey{}, fmt.Errorf("failed to unmarshal DynamoDB item: %w", err)
	}

	return apiKeyItem.APIKey, nil
}

func (d *InboxDAO) ListAPIKeyByUser(ctx context.Context, userID uuid.UUID) ([]model.APIKey, error) {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()

	userKey, _ := GenUserKey(userID)
	input := &dynamodb.QueryInput{
		TableName:              aws.String(d.tableName),
		IndexName:              aws.String(OwnerIndex),
		KeyConditionExpression: aws.String(OWNERKey + " = :" + OWNERKey + " AND SK = :SK"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":" + OWNERKey: &types.AttributeValueMemberS{Value: userKey},
			":SK":          &types.AttributeValueMemberS{Value: APIKeyKey},
		},
	}

	queryPaginator := dynamodb.NewQueryPaginator(d.dbclient, input)
	apiKeys := make([]model.APIKey, 0, MaxBatchItems)
	for queryPaginator.HasMorePages() {
		response, err := queryPaginator.NextPage(ctx)
		if err != nil {
			return apiKeys, fmt.Errorf("get API keys of user failed: %w", err)
		}
		for _, item := range response.Items {
			sk := item["SK"].(*types.AttributeValueMemberS).Value
			if IsAPIKeySK(sk) {
				apiKeyItem := APIKeyItem{}
				err = attributevalue.UnmarshalMap(item, &apiKeyItem)
				if err != nil {
					return apiKeys, fmt.Errorf("unmarshal API key failed: %w", err)
				}
				apiKeys = append(apiKeys, apiKeyItem.APIKey)
			}
		}
	}

	return apiKeys, nil
}

func (d *InboxDAO) DeleteAPIKey(ctx context.Context, ID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()

	pk, sk := GenAPIKeyKey(ID)
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
		return fmt.Errorf("failed to delete API key, %w", err)
	}

	return nil
}

func (d *InboxDAO) CreateAPIKey(
	ctx context.Context,
	ak model.APIKey,
) error {
	ctx, cancel := context.WithTimeout(ctx, d.timeout)
	defer cancel()
	akItem := toAPIKeyItem(ak)
	item, err := attributevalue.MarshalMap(akItem)
	if err != nil {
		return fmt.Errorf("error marshaling API key to db: %w", err)
	}

	out, err := d.dbclient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName:    aws.String(d.tableName),
		Item:         item,
		ReturnValues: types.ReturnValueAllOld,
	})
	if err != nil {
		return err
	}
	createdApiKey := model.APIKey{}
	err = attributevalue.UnmarshalMap(out.Attributes, &createdApiKey)
	return err
}
