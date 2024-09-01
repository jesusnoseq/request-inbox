package model

import "github.com/google/uuid"

type UserProvider struct {
	Provider     string `dynamodbav:"provider"`
	Username     string `dynamodbav:"username"`
	AccessToken  string `dynamodbav:"accessToken"`
	RefreshToken string `dynamodbav:"refreshToken"`
}

type User struct {
	ID           uuid.UUID
	Name         string `dynamodbav:"name"`
	AvatarURL    string `dynamodbav:"avatarURL"`
	Timestamp    int64  `dynamodbav:"unixTimestamp"`
	Email        string `dynamodbav:"email"`
	Provider     string `dynamodbav:"provider" json:"-"`
	Organization string `dynamodbav:"organization"`
}
