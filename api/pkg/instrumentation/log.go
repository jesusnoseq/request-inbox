package instrumentation

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"runtime"
	"strings"

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

func LogError(ctx context.Context, err error, msg string, attrs ...any) {
	pc, file, line, ok := runtime.Caller(1)
	var callerField slog.Attr
	var funcField slog.Attr
	dynamicAttrs := make([]any, 0, len(attrs)+4)
	if ok {
		funcName := runtime.FuncForPC(pc).Name()
		callerField = slog.String("caller", fmt.Sprintf("%s:%d", file, line))
		funcField = slog.String("function", funcName)
	} else {
		callerField = slog.String("caller", "unknown")
		funcField = slog.String("function", "unknown")
	}
	stackTrace := captureStackTrace()
	dynamicAttrs = append(dynamicAttrs, callerField, funcField, slog.String("stackTrace", stackTrace))
	if err != nil {
		dynamicAttrs = append(dynamicAttrs, slog.String("error", err.Error()))
	}
	dynamicAttrs = append(dynamicAttrs, attrs...)
	slog.Default().ErrorContext(ctx, msg, dynamicAttrs...)
}

func captureStackTrace() string {
	const depth = 32
	var pcs [depth]uintptr
	n := runtime.Callers(3, pcs[:])
	frames := runtime.CallersFrames(pcs[:n])

	var builder strings.Builder
	for {
		frame, more := frames.Next()
		fmt.Fprintf(&builder, "%s\n\t%s:%d\n", frame.Function, frame.File, frame.Line)
		if !more {
			break
		}
	}
	return builder.String()
}
