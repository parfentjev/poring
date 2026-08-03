import type { Logger } from 'pino'
import {
  constructAuthenticate,
  constructCap,
  constructPing,
  constructPrivateMessage,
  constructSaslSuccess,
  constructWelcome,
  type Events,
} from './events.js'
import type { Connection } from './index.js'
import { parseRawMessage, type RawMessage } from './message.js'

type EventConstructor<Event extends keyof Events> = (raw: RawMessage) => Events[Event]

export function routeEvent(logger: Logger, connection: Connection, message: string) {
  try {
    const raw = parseRawMessage(message)
    switch (raw.command) {
      case 'PRIVMSG':
        constructAndEmit(connection, raw, constructPrivateMessage)
        break
      case 'PING':
        constructAndEmit(connection, raw, constructPing)
        break
      case 'CAP':
        constructAndEmit(connection, raw, constructCap)
        break
      case 'AUTHENTICATE':
        constructAndEmit(connection, raw, constructAuthenticate)
        break
      case '903':
        constructAndEmit(connection, raw, constructSaslSuccess)
        break
      case '001':
        constructAndEmit(connection, raw, constructWelcome)
        break
    }
  } catch (error) {
    logger.error({ err: error }, 'failed to route event')
  }
}

function constructAndEmit<Event extends keyof Events>(
  connection: Connection,
  raw: RawMessage,
  constructor: EventConstructor<Event>
) {
  connection.emit(constructor(raw))
}
