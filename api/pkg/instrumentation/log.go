package instrumentation

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/jesusnoseq/request-inbox/pkg/config"
)

func ConfigureLog() error {
	level := new(slog.Level)
	err := level.UnmarshalText([]byte(config.GetString(config.LogLevel)))
	if err != nil {
		return fmt.Errorf("error parsing log level %w", err)
	}
	var handler slog.Handler
	switch config.GetString(config.LogFormat) {
	case config.LogFormatJSON:
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	case config.LogFormatText:
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	}
	slog.SetDefault(slog.New(handler))
	return nil
}
