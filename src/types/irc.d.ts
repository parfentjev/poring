import Config from './config'

interface IRCMessage {
  prefix: string
  command: string
  params: string[]
  text: string
}

interface EventContext {
  send: (message: string) => void
  message: IRCMessage
  config: Config
}

interface EventHandler {
  (event: EventContext): void
}
