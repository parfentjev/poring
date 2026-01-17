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
  sasl: SaslConfig
}

export type SaslConfig = {
  enabled: boolean
  username: string | undefined
  password: string | undefined
}

export type ListenerConfig = {
  freshRss: FreshRssConfig
  idleRpg: IdleRpgConfig
}

export type FreshRssConfig = {
  // todo: add cron property, make all props optional
  url: string
  apiKey: string
  notification: string
  target: string
}

export type IdleRpgConfig = {
  cron?: string
  channel?: string
  player?: string
  notification?: string
  target?: string
  isValid(): boolean
}
