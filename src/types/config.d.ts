export interface IConfig {
  server: IServer
  sasl: ISasl
  handler: IHandler
}

export interface IServer {
  host: string
  port: number
  nickname: string
  channels: string[]
}

export interface ISasl {
  enabled: boolean
  username: string
  password: string
}

export interface IHandler {
  next: ICronHandler
  poring: ITimerHandler
}

export interface ICronHandler {
  cron: string
  channel: string
}

export interface ITimerHandler {
  timerRangeStart: number
  timerRangeEnd: number
  channel: string
}
