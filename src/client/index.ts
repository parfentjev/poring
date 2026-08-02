import { connect, type TLSSocket } from 'tls'
import type { Config } from '../config.js'
import type { EventManager, EventContext } from '../event.js'
import type { Events, State } from './events.js'
import { routeEvent } from './router.js'
import type { Logger } from 'pino'

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

  run(): Connection {
    const socket = connect({
      host: this.config.client.serverAddress,
      port: this.config.client.serverPort,
    })

    return new Connection(this.logger, this.config, socket, this.eventManager)
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
