export type Config = {
  server: ServerConfig
  user: UserConfig
  listener: ListenerConfig
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

export type ListenerConfig = {
  freshRSS: FreshRSSConfig
}

export type FreshRSSConfig = {
  url: string
  apiKey: string
  notification: string
  target: string
}
