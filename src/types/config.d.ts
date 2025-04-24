interface Config {
  server: Server
  sasl: Sasl
  handler: Handler
}

interface Server {
  host: string
  port: number
  nickname: string
  channels: string[]
}

interface Sasl {
  enabled: boolean
  username: string
  password: string
}

interface Handler {
  next: CronHandler
  poring: TimerHandler
}

interface CronHandler {
  cron: string
  channel: string
}

interface TimerHandler {
  timerRangeStart: number
  timerRangeEnd: number
  channel: string
}

export default Config
