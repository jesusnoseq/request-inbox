package config

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

type App string
type Key string
type SecretKey string

const (
	API  App = "API"
	Test App = "TEST"

	APIMode       Key    = "API_MODE"
	APIModeLambda string = "lambda"
	APIModeServer string = "server"

	Environment        Key    = "ENVIRONMENT"
	EnvironmentDefault string = "local"
	Version            Key    = "VERSION"
	VersionDefault     string = ""
	ReleaseID          Key    = "RELEASE_ID"
	ReleaseIDDefault   string = ""

	DBEngine       Key    = "DB_ENGINE"
	DBEngineBadger string = "badger"
	DBEngineDynamo string = "dynamo"

	DBBadgerPath        Key    = "DB_BADGER_PATH"
	DBBadgerPathDefault string = "/tmp/inbox.db"

	DBDynamoName        Key    = "DB_DYNAMO_NAME"
	DBDynamoNameDefault string = "inbox_requests"

	APIHTTPPort        Key    = "API_HTTP_PORT"
	APIHTTPPortDefault string = "8080"

	HTTPClientTimeoutSeconds        Key = "API_HTTP_CLIENT_TIMEOUT_SECONDS"
	HTTPClientTimeoutSecondsDefault int = 20

	LogLevel      Key    = "LOG_LEVEL"
	LogFormat     Key    = "LOG_FORMATER"
	LogFormatJSON string = "json"
	LogFormatText string = "text"

	AWSRegion        Key    = "AWS_REGION"
	AWSRegionDefault string = "eu-central-1"

	SnapshotVersion        Key    = "SNAPSHOT_VERSION"
	SnapshotVersionDefault string = "local"

	LoginGithubClientId           Key    = "LOGIN_GITHUB_CLIENT_ID"
	LoginGithubClientSecret       Key    = "LOGIN_GITHUB_CLIENT_SECRET"
	LoginGithubCallback           Key    = "LOGIN_GITHUB_CALLBACK"
	LoginGithubCallbackDefault    string = "https://api.request-inbox.com/api/v1/auth/github/callback"
	LoginGoogleClientId           Key    = "LOGIN_GOOGLE_CLIENT_ID"
	LoginGoogleClientSecret       Key    = "LOGIN_GOOGLE_CLIENT_SECRET"
	LoginGoogleCallback           Key    = "LOGIN_GOOGLE_CALLBACK"
	LoginGoogleCallbackDefault    string = "https://api.request-inbox.com/api/v1/auth/google/callback"
	FrontendApplicationURL        Key    = "FRONTEND_APPLICATION_URL"
	FrontendApplicationURLDefault string = "https://request-inbox.com/"
	AuthCookieDomain              Key    = "AUTH_COOKIE_DOMAIN"
	AuthCookieDomainDefault       string = "request-inbox.com"
	CORSAllowOrigins              Key    = "CORS_ALLOW_ORIGINS"
	CORSAllowOriginsDefault       string = "https://request-inbox.com https://api.request-inbox.com"
	JWTSecret                     Key    = "JWT_SECRET"
	JWTSecretDefault              string = "d14f50e6a26bbbd8922a41449c7f00bb87b4629acfc153403f5ed1342cf6fcd0"
	UserJTISalt                   Key    = "USER_JTI_SALT"
	UserJTISaltDefault            string = "AcL30zFxQf"

	EnabledMonitoring        Key    = "ENABLED_MONITORING"
	EnabledMonitoringDefault bool   = true
	PostHogURL               Key    = "POSTHOG_URL"
	PostHogURLDefault        string = "https://eu.i.posthog.com"
	PostHogAPIKey            Key    = "POSTHOG_API_KEY"
	PostHogAPIKeyDefault     string = "phc_lbluzxMcaNGnDqTwTgptNLh8YBR7d89t2x63b3RsvBh"

	// Features
	EnableListingPublicInbox  Key  = "ENABLE_LISTING_PUBLIC_INBOX"
	EnableListingInboxDefault bool = false
	EnablePrintConfig         Key  = "PRINT_CONFIG"
	EnablePrintConfigDefault  bool = false
)

func LoadConfig(app App) {
	setDefaults(app)
	viper.AutomaticEnv()
	if app == Test {
		gin.SetMode(gin.TestMode)
		randomSubdir, err := os.MkdirTemp(os.TempDir(), "db-*")
		if err != nil {
			panic(fmt.Sprintf("failed to create DB subdirectory: %v", err))
		}
		Set(DBBadgerPath, randomSubdir)
	}
	PrintConfig()
}

func setDefaults(app App) {
	setDefault(Environment, EnvironmentDefault)
	setDefault(APIMode, APIModeServer)
	setDefault(ReleaseID, ReleaseIDDefault)
	setDefault(Version, VersionDefault)
	setDefault(APIHTTPPort, APIHTTPPortDefault)

	// TODO
	setDefault(DBEngine, DBEngineDynamo)
	setDefault(DBBadgerPath, DBBadgerPathDefault)

	setDefault(DBDynamoName, DBDynamoNameDefault)

	setDefault(LogLevel, slog.LevelDebug.String())
	setDefault(LogFormat, LogFormatText)

	setDefault(AWSRegion, AWSRegionDefault)

	setDefault(SnapshotVersion, SnapshotVersionDefault)

	// AUTH
	setDefault(FrontendApplicationURL, FrontendApplicationURLDefault)
	setDefault(AuthCookieDomain, AuthCookieDomainDefault)

	setDefault(LoginGithubCallback, LoginGithubCallbackDefault)
	setDefault(LoginGoogleCallback, LoginGoogleCallbackDefault)
	setDefault(CORSAllowOrigins, CORSAllowOriginsDefault)

	if app == Test {
		setDefault(UserJTISalt, UserJTISaltDefault)
		setDefault(JWTSecret, JWTSecretDefault)
	}

	// FEATURES
	setDefault(EnableListingPublicInbox, EnableListingInboxDefault)
	setDefault(EnablePrintConfig, EnableListingInboxDefault)

	setDefault(EnabledMonitoring, EnabledMonitoringDefault)
	setDefault(PostHogURL, PostHogURLDefault)
	setDefault(PostHogAPIKey, PostHogAPIKeyDefault)
}

func setDefault[T string | int | bool](k Key, v T) {
	viper.SetDefault(string(k), v)
}

func PrintConfig() {
	if !GetBool(EnablePrintConfig) {
		return
	}
	settings := viper.AllSettings()
	for key, value := range settings {
		fmt.Printf("%s: %v\n", key, value)
	}
}

func Set(k Key, v interface{}) {
	viper.Set(string(k), v)
}

func GetString(k Key) string {
	return viper.Get(string(k)).(string)
}

func GetBool(k Key) bool {
	return viper.GetBool(string(k))
}

func GetStringSlice(k Key) []string {
	return viper.GetStringSlice(string(k))
}

func GetInt(k Key) int {
	return viper.GetInt(string(k))
}
