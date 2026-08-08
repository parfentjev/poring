import { connect, type TLSSocket } from 'tls'
import type { Config } from '../config.js'
import type { EventManager, EventContext } from '../event.js'
import type { Events, State } from './events.js'
import { routeEvent } from './router.js'
import type { Logger } from 'pino'
import { once } from 'events'
import type { Metadata } from '../metadata.js'
import { setTimeout } from 'timers/promises'

const RECONNECT_DELAY_MS = 10_000

export type ClientEvenetManager = EventManager<State, Events>

export type ClientProps = {
  logger: Logger
  metadata: Metadata
  config: Config
  eventManager: ClientEvenetManager
  signal: AbortSignal
}

export class Client {
  private readonly props: ClientProps

  constructor(props: ClientProps) {
    this.props = { ...props, logger: props.logger.child({ component: 'client' }) }
  }

  async run() {
    const { logger, config, signal } = this.props

    while (signal.aborted === false) {
      const tlsSocket = connect({
        host: config.client.serverAddress,
        port: config.client.serverPort,
      })

      try {
        await once(tlsSocket, 'secureConnect', { signal })
        await new Connection(tlsSocket, this.props).closed()
      } catch (err) {
        if (signal.aborted) {
          return
        }

        logger.warn({ err }, 'tls socket error')
      } finally {
        tlsSocket.destroy()
      }

      try {
        await setTimeout(RECONNECT_DELAY_MS, undefined, { signal })
      } catch (err) {
        if (signal.aborted) {
          return
        }

        logger.warn({ err }, 'unexpected error while awaiting for reconnect')
      }
    }
  }
}

export class Connection {
  private readonly socket: TLSSocket
  private readonly logger: Logger
  private readonly metadata: Metadata
  private readonly config: Config
  private readonly eventManager: ClientEvenetManager
  private readonly signal: AbortSignal
  private messageBuffer: string

  constructor(socket: TLSSocket, props: ClientProps) {
    this.socket = socket
    this.logger = props.logger
    this.metadata = props.metadata
    this.config = props.config
    this.eventManager = props.eventManager
    this.signal = props.signal
    this.messageBuffer = ''

    this.socket.on('data', this.onData)
    this.emit({ type: 'connected' })

    this.signal.addEventListener('abort', this.onAbort, { once: true })
  }

  emit<Event extends keyof Events>(event: Events[Event]) {
    const ctx: EventContext<State, Events[Event]> = {
      state: {
        logger: this.logger.child({ component: 'event-listener' }),
        metadata: this.metadata,
        config: this.config.listener,
        send: this.send,
      },
      event: event,
    }

    this.eventManager.emit(ctx)
  }

  readonly send = (message: string) => {
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
      this.signal.removeEventListener('abort', this.onAbort)
    }
  }

  private readonly onData = (data: Buffer) => {
    this.messageBuffer += data.toString()

    const messages = this.messageBuffer.split('\r\n')
    this.messageBuffer = messages.pop() ?? ''

    for (const message of messages) {
      this.logger.debug(`=> ${message}`)
      routeEvent(this.logger, this, message)
    }
  }

  private readonly onAbort = (_: Event) => {
    this.send(`QUIT :${this.config.client.quitMessage}`)
  }
}
