package login

import (
	"crypto/rand"
	"encoding/base64"

	"golang.org/x/exp/slog"
)

const OauthStateCookieName = "oauthstate"
const AuthTokenCookieName = "auth_token"

func generateStateString() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		slog.Error("Error generating string for oauth", "error", err)
	}
	return base64.URLEncoding.EncodeToString(b)
}
