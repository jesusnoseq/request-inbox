package config

import (
	"log/slog"

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
	DBDynamoNameDefault string = "requestinbox"

	APIHTTPPort        Key    = "API_HTTP_PORT"
	APIHTTPPortDefault string = "8080"

	HTTPClientTimeoutSeconds        Key = "API_HTTP_CLIENT_TIMEOUT_SECONDS"
	HTTPClientTimeoutSecondsDefault int = 20

	LogLevel      Key    = "LOG_LEVEL"
	LogFormat     Key    = "LOG_FORMATER"
	LogFormatJSON string = "json"
	LogFormatText string = "text"

	// Features
	EnableListingInbox        = "ENABLE_LISTING_INBOX"
	EnableListingInboxDefault = true
)

func LoadConfig(app App) {
	setDefaults(app)
	viper.AutomaticEnv()
}

func setDefaults(app App) {
	setDefault(Environment, EnvironmentDefault)
	setDefault(APIMode, APIModeServer)
	setDefault(ReleaseID, ReleaseIDDefault)
	setDefault(Version, VersionDefault)
	setDefault(APIHTTPPort, APIHTTPPortDefault)

	setDefault(DBEngine, DBEngineBadger)
	setDefault(DBBadgerPath, DBBadgerPathDefault)

	setDefault(DBDynamoName, DBDynamoNameDefault)

	setDefault(LogLevel, slog.LevelDebug.String())
	setDefault(LogFormat, LogFormatText)

	setDefault(EnableListingInbox, EnableListingInboxDefault)
}

func setDefault[T string | int | bool](k Key, v T) {
	viper.SetDefault(string(k), v)
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
