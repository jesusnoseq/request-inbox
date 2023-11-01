package database_test

import (
	"context"
	"testing"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/database"
)

func TestGetDatabaseEngine(t *testing.T) {
	badger := database.GetDatabaseEngine(config.DBEngineBadger)
	if badger != database.Badger {
		t.Errorf("GetDatabaseEngine(%v) = %v, want %v", config.DBEngineBadger, badger, database.Badger)
	}
}

func TestGetInboxDAOSuccess(t *testing.T) {
	config.LoadConfig(config.Test)
	ctx := context.Background()
	db, err := database.GetInboxDAO(ctx, database.Badger)
	defer func() {
		if err := db.Close(ctx); err != nil {
			t.Errorf("error closing db: %v", err)
		}
	}()
	if err != nil {
		t.Errorf("expected no error got %v", err)
	}
	if db == nil {
		t.Errorf("GetInboxDAO(ctx, %v) = %v, want not nil", config.DBEngineBadger, db)
	}
}

func TestGetInboxDAOEngineDoesNotExits(t *testing.T) {
	config.LoadConfig(config.Test)
	ctx := context.Background()
	fakeEngine := "fakeEngine"
	db, err := database.GetInboxDAO(ctx, database.Engine(fakeEngine))
	if err == nil {
		t.Errorf("expected error got %v", err)
	}
	if db != nil {
		t.Errorf("GetInboxDAO(ctx, %v) = %v, want nil", fakeEngine, db)
	}
}
