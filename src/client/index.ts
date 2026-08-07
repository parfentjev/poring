import { connect, type TLSSocket } from 'tls'
import type { Config } from '../config.js'
import type { EventManager, EventContext } from '../event.js'
import type { Events, State } from './events.js'
import { routeEvent } from './router.js'
import type { Logger } from 'pino'
import { once } from 'events'
import type { Metadata } from '../metadata.js'

const RECONNECT_DELAY_MS = 10_000

export type ClientEvenetManager = EventManager<State, Events>

export type ClientProps = {
  logger: Logger
  metadata: Metadata
  config: Config
  eventManager: ClientEvenetManager
}

export class Client {
  private readonly logger: Logger
  private readonly metadata: Metadata
  private readonly config: Config
  private readonly eventManager: ClientEvenetManager
  private reconnect: boolean

  constructor(props: ClientProps) {
    this.logger = props.logger.child({ component: 'client' })
    this.metadata = props.metadata
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
          metadata: this.metadata,
          config: this.config,
          socket: tlsSocket,
          eventManager: this.eventManager,
        })

        await connection.closed()
      } catch (err) {
        this.logger.warn({ err }, 'tls socket error')
      } finally {
        tlsSocket.destroy()
      }

      await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY_MS))
    }
  }
}

type ConnectionProps = {
  logger: Logger
  metadata: Metadata
  config: Config
  socket: TLSSocket
  eventManager: ClientEvenetManager
}

export class Connection {
  private readonly logger: Logger
  private readonly metadata: Metadata
  private readonly config: Config
  private readonly socket: TLSSocket
  private readonly eventManager: ClientEvenetManager
  private messageBuffer: string

  constructor(props: ConnectionProps) {
    this.logger = props.logger
    this.metadata = props.metadata
    this.config = props.config
    this.socket = props.socket
    this.eventManager = props.eventManager
    this.messageBuffer = ''

    this.socket.on('data', this.onData.bind(this))
    this.emit({ type: 'connected' })
  }

  emit<Event extends keyof Events>(event: Events[Event]) {
    const ctx: EventContext<State, Events[Event]> = {
      state: {
        logger: this.logger.child({ component: 'event-listener' }),
        metadata: this.metadata,
        config: this.config.listener,
        send: this.send.bind(this),
      },
      event: event,
    }

    this.eventManager.emit(ctx)
  }

  send(message: string) {
    if (message.includes('\r') || message.includes('\n')) {
      return
    }

    this.logger.debug(`<= ${message}`)
    this.socket.write(`${message}\r\n`, (e: unknown) => e && this.logger.warn({ err: e }, 'socket.write error'))
  }

  async closed() {
    try {
      await once(this.socket, 'close')
    } catch (error: unknown) {
      this.logger.warn({ err: error }, 'socket closed with an error')
    } finally {
      this.emit({ type: 'disconnected' })
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
