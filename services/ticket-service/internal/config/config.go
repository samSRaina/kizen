package config

import (
	"os"
)

type Config struct {
	ServerPort  string
	DatabaseURL string
}

func Load() *Config {
	return &Config{
		ServerPort:  os.Getenv("TICKET_SERVER_PORT"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}
}
