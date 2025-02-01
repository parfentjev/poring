package config

type Config struct {
	Server ServerConfig `yaml:"server"`
}

type ServerConfig struct {
	Address  string   `yaml:"address"`
	Tls      bool     `yaml:"tls"`
	Nickname string   `yaml:"nickname"`
	Channels []string `yaml:"channels"`
}
