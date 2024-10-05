package model

import (
	"fmt"
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

func generateAPIKey() (string, error) {
	return randomString(32)
}

func NewAPIKey(userID uuid.UUID) (APIKey, error) {
	apiKey, err := generateAPIKey()
	if err != nil {
		fmt.Println("Error generating API key:", err)
		return APIKey{}, err
	}
	return APIKey{
		ID:           NewApiKeyID(apiKey),
		Name:         "",
		OwnerID:      userID,
		APIKey:       apiKey,
		CreationDate: time.Now(),
		ExpiryDate:   time.Now().AddDate(0, 3, 0),
		IsActive:     true,
		//Permissions:  ApiKeyPermissions{},
	}, nil
}

func NewApiKeyID(key string) uuid.UUID {
	return uuid.NewSHA1(uuid.NameSpaceOID, []byte(key))
}
