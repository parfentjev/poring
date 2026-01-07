import type { Config, ListenerConfig } from './config'
import type { Clock } from './utils'

export type Message = {
  prefix: string
  command: string
  params: string[]
  text: string
}

export type SendFunction = (string: string) => void

export type EventHandler<T> = (context: T) => Promise<void>

export type IrcClientContext = {
  send: SendFunction
  config: Config
}

export type IrcEventContext = {
  send: SendFunction
  message: Message
  config: Config
  clock: Clock
}

export type CronJobContext = {
  send: SendFunction
  config: ListenerConfig
}
