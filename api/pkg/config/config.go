package config

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/spf13/viper"
)

type App string
type Key string
type SecretKey string

const (
	API  App = "API"
	Test App = "TEST"

	Environment        Key    = "ENVIRONMENT"
	EnvironmentDefault string = "local"
	Version            Key    = "VERSION"
	VersionDefault     string = ""
	ReleaseID          Key    = "RELEASE_ID"
	ReleaseIDDefault   string = ""

	DBEngine       Key    = "DB_ENGINE"
	DBEngineBadger string = "badger"

	DBBadgerPath        Key    = "DB_BADGER_PATH"
	DBBadgerPathDefault string = "/tmp/inbox.db"

	APIHTTPPort        Key    = "API_HTTP_PORT"
	APIHTTPPortDefault string = "8080"

	HTTPClientTimeoutSeconds        Key = "API_HTTP_CLIENT_TIMEOUT_SECONDS"
	HTTPClientTimeoutSecondsDefault int = 4

	LogLevel      Key    = "LOG_LEVEL"
	LogFormat     Key    = "LOG_FORMATER"
	LogFormatJSON string = "json"
	LogFormatText string = "text"
)

func LoadConfig(app App) {
	setDefaults(app)
	viper.AutomaticEnv()
}

func ConfigureLog() error {
	level := new(slog.Level)
	err := level.UnmarshalText([]byte(GetString(LogLevel)))
	if err != nil {
		return fmt.Errorf("error parsing log level %w", err)
	}
	var handler slog.Handler
	switch GetString(LogFormat) {
	case LogFormatJSON:
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	case LogFormatText:
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	}
	slog.SetDefault(slog.New(handler))
	return nil
}

func setDefaults(app App) {
	setDefault(Environment, EnvironmentDefault)
	setDefault(ReleaseID, ReleaseIDDefault)
	setDefault(Version, VersionDefault)
	setDefault(APIHTTPPort, APIHTTPPortDefault)

	setDefault(DBEngine, DBEngineBadger)
	setDefault(DBBadgerPath, DBBadgerPathDefault)

	setDefault(LogLevel, slog.LevelDebug.String())
	setDefault(LogFormat, LogFormatText)
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
