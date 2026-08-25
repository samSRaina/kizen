package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort  string
	DatabaseURL string
}

func Load() *Config {
	_ = godotenv.Load()
	return &Config{
		ServerPort:  os.Getenv("SERVER_PORT"),
		DatabaseURL: os.Getenv("DATABASE_URL"),
	}
}
