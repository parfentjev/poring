import Config from './config'

interface IMessage {
  prefix: string
  command: string
  params: string[]
  text: IText
  isChannel(): boolean
}

interface IText {
  value: string
  command(): string
}

interface IEventContext {
  send(message: string): void
  message: IMessage
  config: Config
}

interface IEventHandler {
  (event: IEventContext): void
}
