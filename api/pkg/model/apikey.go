package model

import (
	"log/slog"
	"time"

	"github.com/google/uuid"
)

type PermissionDomain string
type PermissionAction string

const Inboxes PermissionDomain = "Inboxes"
const Create PermissionAction = "Create"
const Read PermissionAction = "Read"
const Update PermissionAction = "Update"
const Delete PermissionAction = "Delete"

const APIKeyEntityName = "API key"

const API_KEY_SIZE = 32

type APIKeyPermissions map[PermissionDomain]map[PermissionAction]bool

type APIKey struct {
	ID           uuid.UUID
	Name         string
	OwnerID      uuid.UUID
	APIKey       string
	CreationDate time.Time
	ExpiryDate   time.Time
	IsActive     bool
	Permissions  APIKeyPermissions
}

func (ak APIKey) WithMaskedKey() APIKey {
	if len(ak.APIKey) > 6 {
		ak.APIKey = ak.APIKey[:3] + "***" + ak.APIKey[len(ak.APIKey)-3:]
	}
	return ak
}

func generateAPIKey() (string, error) {
	return randomString(API_KEY_SIZE)
}

func NewAPIKey(userID uuid.UUID) (APIKey, error) {
	apiKey, err := generateAPIKey()
	if err != nil {
		slog.Error("Error generating API key:", "error", err)
		return APIKey{}, err
	}
	return APIKey{
		ID:           NewAPIKeyID(apiKey),
		Name:         "",
		OwnerID:      userID,
		APIKey:       apiKey,
		CreationDate: time.Now().UTC(),
		ExpiryDate:   time.Now().UTC().AddDate(0, 3, 0),
		IsActive:     true,
		//Permissions:  ApiKeyPermissions{},
	}, nil
}

func NewAPIKeyID(key string) uuid.UUID {
	return uuid.NewSHA1(uuid.NameSpaceOID, []byte(key))
}
