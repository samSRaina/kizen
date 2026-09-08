// Package config is the single entrypoint to gain access to env vars
// for independent services. The v0 implementation had individual
// '[name]-service/internal/config/config.go'. v1 does away with
// redundancy via a single entry point for all services.

package config

import (
	"fmt"
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
}

// The Load funciton takes service name as input paramter and
// returns service env config.
func Load(service string) (*Config, error) {
	const dbUrl = "DATABASE_URL"
	port := service + "_PORT"

	cfg := &Config{
		Port:        os.Getenv(port),
		DatabaseURL: os.Getenv(dbUrl),
	}

	var missing []string
	if cfg.Port == "" {
		missing = append(missing, service)
	}

	if cfg.DatabaseURL == "" {
		missing = append(missing, dbUrl)
	}

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing env vars: %v", missing)
	}
	return cfg, nil
}
