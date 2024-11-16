package login

import (
	"encoding/base64"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

func TestGenerateJWT(t *testing.T) {
	config.LoadConfig(config.Test)
	user := model.User{
		ID:           uuid.New(),
		Name:         "testname",
		AvatarURL:    "http://image.jpg",
		Email:        "test@mail.dev",
		Organization: "org",
		Provider:     model.UserProvider{},
		Timestamp:    time.Now().Unix(),
	}
	jwt, err := GenerateJWT(user)
	t_util.AssertNoError(t, err)
	t_util.AssertStringNotEquals(t, jwt, "")
	parts := strings.Split(jwt, ".")
	t_util.AssertLen(t, parts, 3)

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	t_util.AssertNoError(t, err)
	var claims JWTClaims
	err = json.Unmarshal(payload, &claims)
	t_util.AssertNoError(t, err)
	t_util.AssertStringEquals(t, claims.Subject, user.ID.String())
	t_util.AssertStringEquals(t, claims.Issuer, appName)
	t_util.AssertStringEquals(t, strings.Join(claims.Audience, " "), appAudience)
	t_util.AssertTimeDiffFromNow(t, claims.ExpiresAt.Time, 24*time.Hour, 3*time.Second)

	parsedClaims, err := ParseToken(jwt)
	t_util.AssertNoError(t, err)
	t_util.AssertEqualsAsJson(t, parsedClaims, claims)
}

func TestReadJWTToken(t *testing.T) {
	config.LoadConfig(config.Test)
	user := model.User{
		ID:    uuid.New(),
		Email: "test@mail.dev",
	}
	jwt, err := GenerateJWT(user)
	t_util.AssertNoError(t, err)

	testCases := []struct {
		name          string
		token         string
		expectedUser  model.User
		expectedError bool
	}{
		{
			name:          "Valid Token",
			token:         jwt,
			expectedUser:  user,
			expectedError: false,
		},
		{
			name:          "Invalid Token",
			token:         "invalid_token",
			expectedUser:  model.User{},
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			user, err := ReadJWTToken(tc.token)

			if (err != nil) != tc.expectedError {
				t_util.AssertNoError(t, err)
			}
			t_util.AssertEqualsAsJson(t, user, tc.expectedUser)
		})
	}
}
