package provider

import (
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"
)

type OAuthConfig struct {
	Config      *oauth2.Config
	AuthURL     string
	TokenURL    string
	UserInfoURL string
}

type OauthProvider string

const GitHub OauthProvider = "github"
const Google OauthProvider = "google"

type ProviderManager struct {
	oAuthConfigs map[OauthProvider]*OAuthConfig
}

func NewProviderManager() IProviderManager {
	return &ProviderManager{}
}

func (p *ProviderManager) GetOAuthConfig(provider string) (OAuthConfig, bool) {
	if p.oAuthConfigs != nil {
		c, exists := p.oAuthConfigs[OauthProvider(provider)]
		return *c, exists
	}
	p.oAuthConfigs = map[OauthProvider]*OAuthConfig{
		GitHub: {
			Config: &oauth2.Config{
				ClientID:     config.GetString(config.LoginGithubClientId),
				ClientSecret: config.GetString(config.LoginGithubClientSecret),
				RedirectURL:  config.GetString(config.LoginGithubCallback),
				Scopes:       []string{"read:user"},
				Endpoint:     github.Endpoint,
			},
			UserInfoURL: "https://api.github.com/user",
		},
		Google: {
			Config: &oauth2.Config{
				ClientID:     config.GetString(config.LoginGoogleClientId),
				ClientSecret: config.GetString(config.LoginGoogleClientSecret),
				RedirectURL:  config.GetString(config.LoginGoogleCallback),
				Scopes:       []string{"openid", "email", "profile"},
				Endpoint:     google.Endpoint,
			},
			UserInfoURL: "https://www.googleapis.com/oauth2/v2/userinfo",
		},
	}

	c, exists := p.oAuthConfigs[OauthProvider(provider)]
	return *c, exists
}

func (p *ProviderManager) ExtractUser(prov string, token *oauth2.Token, jsonInfo []byte) (model.User, error) {
	provider := OauthProvider(prov)
	switch provider {
	case Google:
		return p.extractGoogleUser(token, jsonInfo)
	case GitHub:
		return p.extractGitHubUser(token, jsonInfo)
	default:
		return model.User{}, fmt.Errorf("provider not available: %s", prov)
	}
}

func (p *ProviderManager) extractGoogleUser(token *oauth2.Token, jsonInfo []byte) (model.User, error) {
	var gInfo googleUserInfo
	err := json.Unmarshal(jsonInfo, &gInfo)
	if err != nil {
		slog.Error("Error parsing Google user JSON", "error", err)
		return model.User{}, err
	}

	user := model.NewUser(gInfo.Email)
	user.Name = gInfo.GivenName
	user.AvatarURL = gInfo.Picture
	user.Provider = model.UserProvider{
		Provider:     string(Google),
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
	}

	return user, nil
}

func (p *ProviderManager) extractGitHubUser(token *oauth2.Token, jsonInfo []byte) (model.User, error) {
	var gInfo githubUserInfo
	err := json.Unmarshal(jsonInfo, &gInfo)
	if err != nil {
		slog.Error("Error parsing GitHub user JSON", "error", err)
		return model.User{}, err
	}

	user := model.NewUser(gInfo.Email)
	user.Organization = gInfo.Company
	user.Name = gInfo.Name
	user.AvatarURL = gInfo.AvatarURL
	user.Provider = model.UserProvider{
		Provider:     string(GitHub),
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
	}

	return user, nil
}
