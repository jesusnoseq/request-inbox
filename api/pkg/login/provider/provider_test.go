package provider

import (
	"testing"

	"github.com/jesusnoseq/request-inbox/pkg/config"
	"github.com/jesusnoseq/request-inbox/pkg/t_util"
)

func TestGetOAuthConfig(t *testing.T) {
	config.LoadConfig(config.Test)
	config.Set(config.LoginGithubCallback, "")
	config.Set(config.LoginGithubClientId, "")
	config.Set(config.LoginGithubClientSecret, "")
	config.Set(config.LoginGoogleCallback, "")
	config.Set(config.LoginGoogleClientId, "")
	config.Set(config.LoginGoogleClientSecret, "")

	pm := NewProviderManager()
	ghOauthConfig, exists := pm.GetOAuthConfig(string(GitHub))
	t_util.AssertTrue(t, exists)
	t_util.AssertStructIsNotEmpty(t, ghOauthConfig)

	gOauthConfig, exists := pm.GetOAuthConfig(string(Google))
	t_util.AssertTrue(t, exists)
	t_util.AssertStructIsNotEmpty(t, gOauthConfig)

	oauthConfig, exists := pm.GetOAuthConfig("not a provider")
	t_util.AssertFalse(t, exists)
	t_util.AssertStructIsEmpty(t, oauthConfig)
}
