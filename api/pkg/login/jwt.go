package login

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log/slog"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
)

type JWTClaims struct {
	jwt.RegisteredClaims
	model.User
}

const appName string = "Request Inbox"
const appAudience string = appName + " web user"

// TODO
const hashSalt = "AcL30zFxQf"
const TokenExpiredError = "token expired"

func calculateJTI(id uuid.UUID, now time.Time) string {
	jtiContent := fmt.Sprintf("%s:%d:%s", id, now.Unix(), hashSalt)
	hash := sha256.Sum256([]byte(jtiContent))
	return hex.EncodeToString(hash[:])
}

func GenerateJWT(user model.User) (string, error) {
	var jwtSecret = []byte(config.GetString(config.JWTSecret))
	expirationTime := time.Now().Add(24 * time.Hour)
	now := time.Now()

	claims := &JWTClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID.String(),
			Audience:  jwt.ClaimStrings{appAudience},
			Issuer:    appName,
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        calculateJTI(user.ID, now),
		},
		User: user,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func ParseToken(jwtToken string) (JWTClaims, error) {
	claims := JWTClaims{}
	token, err := jwt.ParseWithClaims(jwtToken, &claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("there was an error in parsing")
		}
		return []byte(config.GetString(config.JWTSecret)), nil
	})
	if err != nil {
		slog.Error("JWT login error", err.Error(), "jwt error")
		return claims, fmt.Errorf("JWT login error: %w", err)
	}
	if token == nil || !token.Valid {
		slog.Error("invalid token", "jwttoken", jwtToken)
		return claims, fmt.Errorf("invalid token")
	}

	exp, err := claims.GetExpirationTime()
	if err != nil {
		return claims, fmt.Errorf("error parsing exp: %w", err)
	}
	if exp.Time.Unix() < time.Now().Unix() {
		slog.Error("token expired", "exp", exp.Time.Unix())
		return claims, fmt.Errorf("%s", TokenExpiredError)
	}

	sub, err := claims.GetSubject()
	if err != nil {
		return claims, fmt.Errorf("error parsing sub: %w", err)
	}
	_, err = uuid.Parse(sub)
	if err != nil {
		return claims, fmt.Errorf("invalid sub: %s", sub)
	}

	aud, err := claims.GetAudience()
	if err != nil {
		return claims, fmt.Errorf("error parsing aud: %w", err)
	}
	if len(aud) != 1 || aud[0] != appAudience {
		return claims, fmt.Errorf("invalid aud: %s", aud)
	}

	iss, err := claims.GetIssuer()
	if err != nil {
		return claims, fmt.Errorf("error parsing iss: %w", err)
	}
	if iss != appName {
		return claims, fmt.Errorf("invalid iss: %s", iss)
	}

	nbf, err := claims.GetNotBefore()
	if err != nil {
		return claims, fmt.Errorf("error parsing nbf: %w", err)
	}
	if nbf.Time.Unix() > time.Now().Unix() {
		slog.Error("token is not valid yet", "nbf", nbf.Time.Unix())
		return claims, fmt.Errorf("token not valid yet")
	}

	iat, err := claims.GetIssuedAt()
	if err != nil {
		return claims, fmt.Errorf("error parsing iat: %w", err)
	}
	if iat.Time.Unix() > time.Now().Unix() {
		slog.Error("a time-travelling token!", "iat", iat.Time.Unix())
		return claims, fmt.Errorf("token not valid")
	}

	return claims, nil
}
