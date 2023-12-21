package dynamo

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-xray-sdk-go/instrumentation/awsv2"
)

func NewDynamoClient(session aws.Config) *dynamodb.Client {
	return dynamodb.NewFromConfig(session, func(o *dynamodb.Options) {
		awsv2.AWSV2Instrumentor(&o.APIOptions)
	})
}
