package config

import (
	"os"

	"github.com/goccy/go-yaml"
)

type Config struct {
	Server ServerConfig `yaml:"server"`
}

type ServerConfig struct {
	Address  string   `yaml:"address"`
	Tls      bool     `yaml:"tls"`
	Nickname string   `yaml:"nickname"`
	Channels []string `yaml:"channels"`
}

func New(file string) (*Config, error) {
	config := &Config{}

	content, err := os.ReadFile(file)
	if err != nil {
		return config, err
	}

	if err = yaml.Unmarshal(content, config); err != nil {
		return config, err
	}

	return config, nil
}
