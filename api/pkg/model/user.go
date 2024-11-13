package model

import (
	"time"

	"github.com/google/uuid"
)

type UserProvider struct {
	Provider     string    `dynamodbav:"provider"`
	Username     string    `dynamodbav:"username"`
	AccessToken  string    `dynamodbav:"accessToken"`
	RefreshToken string    `dynamodbav:"refreshToken"`
	Expiration   time.Time `dynamodbav:"Expiration"`
}

type User struct {
	ID           uuid.UUID
	Name         string       `dynamodbav:"name"`
	AvatarURL    string       `dynamodbav:"avatarURL"`
	Email        string       `dynamodbav:"email"`
	Organization string       `dynamodbav:"organization"`
	Provider     UserProvider `dynamodbav:"provider" json:"-"`
	Timestamp    int64        `dynamodbav:"unixTimestamp"`
}

const UserEntityName = "User"

func NewUser(email string) User {
	return User{
		ID:        NewUserID(email),
		Email:     email,
		Timestamp: time.Now().Unix(),
	}
}

func NewUserID(email string) uuid.UUID {
	return uuid.NewSHA1(uuid.NameSpaceDNS, []byte(email))
}
