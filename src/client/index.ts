import { connect, type TLSSocket } from 'tls'
import type { Config } from '../config.js'
import type { EventManager, EventContext } from '../event.js'
import type { Events, State } from './events.js'
import { routeEvent } from './router.js'
import type { Logger } from 'pino'
import { once } from 'events'

export type ClientEvenetManager = EventManager<State, Events>

export class Client {
  private readonly logger: Logger
  private readonly config: Config
  private readonly eventManager: ClientEvenetManager
  private reconnect: boolean

  constructor(logger: Logger, config: Config, eventManager: ClientEvenetManager) {
    this.logger = logger.child({ component: 'client' })
    this.config = config
    this.eventManager = eventManager
    this.reconnect = true
  }

  async run() {
    while (this.reconnect) {
      const socket = connect({
        host: this.config.client.serverAddress,
        port: this.config.client.serverPort,
      })

      try {
        // todo: isn't this a bit too low-level for the client?
        // perhaps I should use some library that provides a higher level API
        await once(socket, 'secureConnect')
        if (socket.authorized === false) {
          this.logger.warn({ err: socket.authorizationError }, 'failed to establish secure connection')
          continue
        }

        new Connection(this.logger, this.config, socket, this.eventManager)
        await once(socket, 'close')
      } catch (error) {
        this.logger.warn({ err: error }, 'connection lost')
      } finally {
        socket.destroy()
      }
    }
  }
}

export class Connection {
  private readonly logger: Logger
  private readonly config: Config
  private readonly socket: TLSSocket
  private readonly eventManager: ClientEvenetManager
  private messageBuffer: string

  constructor(logger: Logger, config: Config, socket: TLSSocket, eventManager: ClientEvenetManager) {
    this.logger = logger
    this.config = config
    this.socket = socket
    this.eventManager = eventManager
    this.messageBuffer = ''

    this.socket.on('data', this.onData.bind(this))
    this.socket.on('end', this.onEnd.bind(this))

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
    this.socket.write(message)
    this.socket.write('\r\n')
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

  private onEnd() {
    this.emit('disconnected', {})
  }
}
