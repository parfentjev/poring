export interface IBotConfig {
  server: IServerConfig
  scripts: IScriptsConfig
  storage: IStorageConfig
  sasl: ISaslConfig
}

export interface IServerConfig {
  host: string
  port: number
  nickname: string
  channels: string[]
}

export interface IScriptsConfig {
  scriptsDirectory: string
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
  expression: string
}

export interface ITimerHandlerConfig {
  id: string
  timerRangeStart: number
  timerRangeEnd: number
}
