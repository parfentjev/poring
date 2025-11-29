import type { Config } from './config'

export type Message = {
  prefix: string
  command: string
  params: string[]
  text: string
}

export type SendFunction = (string: string) => void

export type EventContext = {
  send: SendFunction
  message: Message
  config: Config
}

export type EventHandler = {
  (context: EventContext): Promise<void>
}
