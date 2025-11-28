export type Config = {
  server: ServerConfig
  user: UserConfig
}

export type ServerConfig = {
  host: string
  port: number
}

export type UserConfig = {
  nickname: string
  channels: string[]
  sasl: SASLConfig
}

export type SASLConfig = {
  enabled: boolean
  username: string | undefined
  password: string | undefined
}
