package config

import (
	"os"

	"github.com/goccy/go-yaml"
)

func New(file string) (Config, error) {
	config := Config{}

	content, err := os.ReadFile(file)
	if err != nil {
		return config, err
	}

	if err = yaml.Unmarshal(content, &config); err != nil {
		return config, err
	}

	return config, nil
}
