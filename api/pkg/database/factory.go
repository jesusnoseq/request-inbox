package database

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database/embedded"
)

type Engine string

const (
	Badger Engine = "BADGER"
)

func GetDatabaseEngine(des string) Engine {
	m := map[string]Engine{
		string(Badger): Badger,
	}

	return m[strings.ToUpper(des)]
}

func GetInboxDAO(ctx context.Context, e Engine) (InboxDAO, error) {
	slog.Debug("Getting Provision dao engine", slog.String("engine", string(e)))
	switch e {
	case Badger:
		db, err := embedded.NewInboxDB(config.GetString(config.DBBadgerPath), false)
		return db, err
	}
	return nil, fmt.Errorf("Engine %q not registered", e)
}
