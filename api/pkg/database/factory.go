package database

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database/dynamo"
	"github.com/jesusnoseq/request-inbox/pkg/database/embedded"
)

type Engine string

const (
	Badger Engine = "BADGER"
	Dynamo Engine = "DYNAMO"
)

func GetDatabaseEngine(des string) Engine {
	m := map[string]Engine{
		string(Badger): Badger,
		string(Dynamo): Dynamo,
	}

	return m[strings.ToUpper(des)]
}

func GetInboxDAO(ctx context.Context, e Engine) (InboxDAO, error) {
	slog.Debug("Getting Provision dao engine", slog.String("engine", string(e)))
	switch e {
	case Badger:
		dao, err := embedded.NewInboxDB(config.GetString(config.DBBadgerPath), false)
		return dao, err
	case Dynamo:
		ctx := context.Background()
		s, err := dynamo.GetSession(ctx)
		if err != nil {
			return nil, fmt.Errorf("error getting AWS session: %w", err)
		}
		dbClient := dynamo.NewDynamoClient(s)
		dao := dynamo.NewInboxDAO(config.GetString(config.DBDynamoName), dbClient, 10*time.Second)
		return dao, nil
	}
	return nil, fmt.Errorf("Engine %q not registered", e)
}
