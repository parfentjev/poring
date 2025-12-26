import type { Config, ListenerConfig } from './config'

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
}

export type CronJobContext = {
  send: SendFunction
  config: ListenerConfig
}
