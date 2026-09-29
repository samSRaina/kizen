package middleware

import (
	"context"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
)

const LoggerKey contextKey = "logger"

func InjectLogger(baseLogger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			reqID := middleware.GetReqID(ctx)

			reqLogger := baseLogger.With(slog.String("trace_id", reqID))

			if userID, ok := GetUserID(ctx); ok && userID != "" {
				reqLogger = reqLogger.With(slog.String("user_id", userID))
			}

			ctx = context.WithValue(ctx, LoggerKey, reqLogger)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetLogger(ctx context.Context) *slog.Logger {
	if logger, ok := ctx.Value(LoggerKey).(*slog.Logger); ok {
		return logger
	}
	return slog.Default()
}
