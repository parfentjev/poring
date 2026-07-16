package config

import "github.com/caarlos0/env/v11"

type Config struct {
	Server   ServerConfig   `envPrefix:"SERVER_"`
	Identity IdentityConfig `envPrefix:"IDENTITY_"`
	Handler  HandlerConfig  `envPrefix:"HANDLER_"`
}

type ServerConfig struct {
	Address string `env:"ADDRESS,required"`
}

type IdentityConfig struct {
	Nickname string     `env:"NICKNAME,required"`
	Username string     `env:"USERNAME,required"`
	Realname string     `env:"REALNAME" envDefault:"https://codeberg.org/parfentjev/poring/"`
	Sasl     SaslConfig `envPrefix:"SASL_"`
}

type SaslConfig struct {
	Enabled  bool   `env:"ENABLED"`
	Username string `env:"USERNAME"`
	Password string `env:"PASSWORD"`
}

type HandlerConfig struct {
	Core     CoreConfig    `envPrefix:"CORE_"`
	Raweceek RawceekConfig `envPrefix:"RAWECEEK_"`
}

type CoreConfig struct {
	Autojoin string `env:"AUTOJOIN"`
}

type RawceekConfig struct {
	URL string `env:"URL" envDefault:"https://raweceek.eu/api/next-session"`
}

func New() (Config, error) {
	var config Config
	err := env.Parse(&config)

	return config, err
}
