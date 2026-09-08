package config

import (
	"fmt"
	"os"
)

type Config struct {
	Server      string
	DatabaseURL string
}

func Load() (*Config, error) {
	const service = "WORKSPACE_SERVICE_PORT"
	cfg := &Config{
		Server:      os.Getenv(service),
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}

	var missing []string
	if cfg.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}

	if cfg.Server == "" {
		missing = append(missing, service)
	}

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing env vars: %v", missing)
	}
	return cfg, nil
}
