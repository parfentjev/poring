export interface IConfig {
  server: IServerConfig
  storage: IStorageConfig
  sasl: ISaslConfig
  handler: IHandlerConfig
}

export interface IServerConfig {
  host: string
  port: number
  nickname: string
  channels: string[]
}

export interface IStorageConfig {
  host: string
  database: string
  user: string
  password: string
}

export interface ISaslConfig {
  enabled: boolean
  username: string
  password: string
}

export interface IHandlerConfig {
  next: ICronHandlerConfig
  poring: ITimerHandlerConfig
}

export interface ICronHandlerConfig {
  cron: string
  channel: string
}

export interface ITimerHandlerConfig {
  timerRangeStart: number
  timerRangeEnd: number
  channel: string
}
