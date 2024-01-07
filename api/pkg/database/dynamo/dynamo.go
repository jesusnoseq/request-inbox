package dynamo

import (
	"context"
	"sync"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/jesusnoseq/request-inbox/pkg/config"
)

var (
	defaultSession    *aws.Config
	createSessionOnce sync.Once
)

func GetSession(ctx context.Context) (aws.Config, error) {
	var err error
	createSessionOnce.Do(func() {
		var cfg *aws.Config
		cfg, err = create(ctx)
		if err != nil {
			return
		}
		defaultSession = cfg
	})

	return *defaultSession, err
}

func create(ctx context.Context) (*aws.Config, error) {
	region := config.GetString(config.AWSRegion)
	cfg, err := awsconfig.LoadDefaultConfig(
		ctx,
		awsconfig.WithRegion(region))
	if err != nil {
		return nil, err
	}
	return &cfg, nil
}

func NewDynamoClient(session aws.Config) *dynamodb.Client {
	return dynamodb.NewFromConfig(session, func(o *dynamodb.Options) {
		//awsv2.AWSV2Instrumentor(&o.APIOptions)
	})
}
