package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
}

func Load() (*Config, error) {
	const envPort = "WORKSPACE_SERVICE_PORT"

	cfg := &Config{
		Port:        os.Getenv(envPort),
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}

	var missing []string
	if cfg.Port == "" {
		missing = append(missing, envPort)
	}
	if cfg.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing env vars: %v", missing)
	}
	return cfg, nil
}
