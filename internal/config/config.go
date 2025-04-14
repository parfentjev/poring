package config

import (
	"os"

	"github.com/goccy/go-yaml"
)

type Config struct {
	Server  Server  `yaml:"server"`
	Sasl    Sasl    `yaml:"sasl"`
	Handler Handler `yaml:"handler"`
}

type Server struct {
	Address  string   `yaml:"address"`
	Tls      bool     `yaml:"tls"`
	Nickname string   `yaml:"nickname"`
	Channels []string `yaml:"channels"`
}

type Sasl struct {
	Enabled  bool   `yaml:"enabled"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

type Handler struct {
	Next   CronHandler  `yaml:"next"`
	Poring TimerHandler `yaml:"poring"`
}

type CronHandler struct {
	Cron    string `yaml:"cron"`
	Channel string `yaml:"channel"`
}

type TimerHandler struct {
	TimerRangeStart int    `yaml:"timerRangeStart"`
	TimerRangeEnd   int    `yaml:"timerRangeEnd"`
	Channel         string `yaml:"channel"`
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
