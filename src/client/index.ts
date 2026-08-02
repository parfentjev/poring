import { connect, type TLSSocket } from 'tls'
import type { Config } from '../config.js'
import type { EventManager, EventContext } from '../event.js'
import type { Events, State } from './events.js'
import { routeEvent } from './router.js'
import type { Logger } from 'pino'
import { once } from 'events'

const RECONNECT_DELAY_MS = 10_000

export type ClientEvenetManager = EventManager<State, Events>

export type ClientProps = {
  logger: Logger
  config: Config
  eventManager: ClientEvenetManager
}

export class Client {
  private readonly logger: Logger
  private readonly config: Config
  private readonly eventManager: ClientEvenetManager
  private reconnect: boolean

  constructor(props: ClientProps) {
    this.logger = props.logger.child({ component: 'client' })
    this.config = props.config
    this.eventManager = props.eventManager
    this.reconnect = true
  }

  async run() {
    while (this.reconnect) {
      const tlsSocket = connect({
        host: this.config.client.serverAddress,
        port: this.config.client.serverPort,
      })

      try {
        // secureConnect means we're ready to go as far as I'm concerned
        // https://nodejs.org/api/tls.html#event-secureconnect
        await once(tlsSocket, 'secureConnect')

        const connection = new Connection({
          logger: this.logger,
          config: this.config,
          socket: tlsSocket,
          eventManager: this.eventManager,
        })

        await connection.closed()
      } catch (error) {
        this.logger.warn({ err: error }, 'tls socket error')
      } finally {
        tlsSocket.destroy()
      }

      await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS))
    }
  }
}

type ConnectionProps = {
  logger: Logger
  config: Config
  socket: TLSSocket
  eventManager: ClientEvenetManager
}

export class Connection {
  private readonly logger: Logger
  private readonly config: Config
  private readonly socket: TLSSocket
  private readonly eventManager: ClientEvenetManager
  private messageBuffer: string

  constructor(props: ConnectionProps) {
    this.logger = props.logger
    this.config = props.config
    this.socket = props.socket
    this.eventManager = props.eventManager
    this.messageBuffer = ''

    this.socket.on('data', this.onData.bind(this))
    this.emit('connected', {})
  }

  emit<Event extends keyof Events>(eventType: Event, event: Events[Event]) {
    const context: EventContext<State, Events[Event]> = {
      state: {
        logger: this.logger.child({ component: 'event-listener' }),
        config: this.config.listener,
        send: this.send.bind(this),
      },
      event: event,
    }

    this.eventManager.emit(eventType, context)
  }

  send(message: string) {
    this.logger.debug(`<= ${message}`)
    this.socket.write(`${message}\r\n`, (e: unknown) => e && this.logger.warn({ err: e }, 'socket.write error'))
  }

  async closed() {
    try {
      await once(this.socket, 'close')
    } catch (error: unknown) {
      this.logger.warn({ err: error }, 'socket closed with an error')
    } finally {
      this.emit('disconnected', {})
    }
  }

  private onData(data: Buffer) {
    this.messageBuffer += data.toString()

    const messages = this.messageBuffer.split('\r\n')
    this.messageBuffer = messages.pop() ?? ''

    for (const message of messages) {
      this.logger.debug(`=> ${message}`)
      routeEvent(this.logger, this, message)
    }
  }
}
