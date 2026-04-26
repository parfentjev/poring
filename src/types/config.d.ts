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
  raweCeek: RaweCeekConfig
  freshRss: FreshRssConfig
  idleRpg: IdleRpgConfig
}

export type RaweCeekConfig = {
  enabled?: boolean
  url?: string
  isEnabled(): this is Required<RaweCeekConfig>
}

export type FreshRssConfig = {
  enabled?: boolean
  url?: string
  apiKey?: string
  notification?: string
  target?: string
  isEnabled(): this is Required<FreshRssConfig>
}

export type IdleRpgConfig = {
  enabled?: boolean
  cron?: string
  channel?: string
  player?: string
  notification?: string
  target?: string
  isEnabled(): this is Required<IdleRpgConfig>
}
