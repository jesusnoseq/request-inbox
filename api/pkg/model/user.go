package model

import (
	"time"

	"github.com/google/uuid"
)

// User roles
const (
	RoleUser  = "user"
	RoleAdmin = "admin"
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
	Role         string       `dynamodbav:"role"`
	Provider     UserProvider `dynamodbav:"provider" json:"-"`
	Timestamp    int64        `dynamodbav:"unixTimestamp"`
}

const UserEntityName = "User"

func NewUser(email string) User {
	return User{
		ID:        NewUserID(email),
		Email:     email,
		Role:      RoleUser,
		Timestamp: time.Now().Unix(),
	}
}

func NewUserID(email string) uuid.UUID {
	return uuid.NewSHA1(uuid.NameSpaceDNS, []byte(email))
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

func (u *User) IsUser() bool {
	return u.Role == RoleUser || u.Role == ""
}
