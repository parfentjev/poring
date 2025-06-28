export interface Config {
  server: ServerConfig
  scripts: ScriptManagerConfig
  storage: StorageConfig
  sasl: SaslConfig
}

export interface ServerConfig {
  host: string
  port: number
  nickname: string
  channels: string[]
}

export interface ScriptManagerConfig {
  scriptsDirectory: string
}

export interface StorageConfig {
  host: string
  database: string
  user: string
  password: string
}

export interface SaslConfig {
  enabled: boolean
  username: string
  password: string
}

export interface CronHandlerConfig {
  expression: string
}

export interface TimerHandlerConfig {
  id: string
  timerRangeStart: number
  timerRangeEnd: number
}
