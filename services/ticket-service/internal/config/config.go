package config

import (
	"fmt"
	"os"
)

type Config struct {
	ServerPort  string
	DatabaseURL string
}

func Load() (*Config, error) {
	cfg := &Config{
		ServerPort:  os.Getenv("TICKET_SERVICE_PORT"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}

	var missing []string
	if cfg.ServerPort == "" {
		missing = append(missing, "TICKET_SERVICE_PORT")
	}

	if cfg.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required env variables: %v", missing)
	}
	return cfg, nil
}
