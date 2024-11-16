package provider

import (
	"github.com/jesusnoseq/request-inbox/pkg/model"
	"golang.org/x/oauth2"
)

//go:generate mockgen -destination=provider_mock/provider_mock.go -package=provider_mock github.com/jesusnoseq/request-inbox/pkg/login/provider IProviderManager

type IProviderManager interface {
	GetOAuthConfig(provider string) (OAuthConfig, bool)
	ExtractUser(prov string, token *oauth2.Token, jsonInfo []byte) (model.User, error)
}
