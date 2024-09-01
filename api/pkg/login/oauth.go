package login

import (
	"crypto/rand"
	"encoding/base64"
)

const OauthStateCookieName = "oauthstate"
const AuthTokenCookieName = "auth_token"

func generateStateString() string {
	b := make([]byte, 16)
	rand.Read(b)
	return base64.URLEncoding.EncodeToString(b)
}
