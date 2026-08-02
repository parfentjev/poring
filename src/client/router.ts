import type { Logger } from 'pino'
import { constructPing, constructWelcome, type Events } from './events.js'
import type { Connection } from './index.js'
import { parseRawMessage, type RawMessage } from './message.js'

type EventConstructor<Event extends keyof Events> = (raw: RawMessage) => Events[Event]

export function routeEvent(logger: Logger, connection: Connection, message: string) {
  try {
    const raw = parseRawMessage(message)
    switch (raw.command) {
      case 'PING':
        constructAndEmit(connection, raw, 'ping', constructPing)
        break
      case '001':
        constructAndEmit(connection, raw, 'welcome', constructWelcome)
        break
    }
  } catch (error) {
    logger.error({ error }, 'failed to route event')
  }
}

function constructAndEmit<Event extends keyof Events>(
  connection: Connection,
  raw: RawMessage,
  eventType: Event,
  constructor: EventConstructor<Event>
) {
  const event = constructor(raw)
  connection.emit(eventType, event)
}
