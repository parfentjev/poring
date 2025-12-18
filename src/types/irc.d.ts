import type { Config, ListenerConfig } from './config'

export type Message = {
  prefix: string
  command: string
  params: string[]
  text: string
}

export type SendFunction = (string: string) => void

export type IrcEventContext = {
  send: SendFunction
  message: Message
  config: Config
}

export type IrcEventHandler = {
  (context: IrcEventContext): Promise<void>
}

export type ClientEventHandler = () => Promise<void>

export type CronEventContext = {
  send: SendFunction
  config: ListenerConfig
}

export type CronEventHandler = (context: CronEventContext) => Promise<void>
