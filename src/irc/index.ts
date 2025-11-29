import { TLSSocket } from 'tls'

import { connect } from 'tls'
import type { Config } from '../types/config'
import type { EventHandler, Message } from '../types/irc'
import { SASLAuthenticator } from './authenticator'
import { EventEmitter } from 'events'

const repositoryUrl = 'https://github.com/parfentjev/poring'

export class IRCClient extends EventEmitter {
  private socket: TLSSocket | undefined
  private eventHandlers = new Map<string, EventHandler[]>()
  private terminating = false

  constructor(private config: Config) {
    super()
  }

  start() {
    this.emit('connecting')

    this.socket = connect({
      host: this.config.server.host,
      port: this.config.server.port,
    })

    this.socket.on('data', this.onData.bind(this))
    this.socket.on('end', this.onEnd.bind(this))

    if (this.config.user.sasl.enabled) {
      const authenticator = new SASLAuthenticator(this, this.config.user.sasl)
      authenticator.start()
    }

    this.send(`NICK ${this.config.user.nickname}`)
    this.send(`USER poring 0 * :${repositoryUrl}`)
  }

  stop() {
    this.terminating = true
    this.send(`QUIT :${repositoryUrl}`)
  }

  send = (message: string) => {
    if (!this.socket || this.socket.closed) return

    console.log(`<= ${message}`)
    this.socket.write(`${message}\r\n`)
  }

  addEventHandler = (event: string, handler: EventHandler) => {
    const handlers = this.eventHandlers.get(event) ?? []
    handlers.push(handler)

    this.eventHandlers.set(event, handlers)
  }

  private onData(data: Buffer) {
    data
      .toString()
      .trim()
      .split('\r\n')
      .forEach((raw) => {
        console.log(`=> ${raw}`)

        try {
          const message = this.parseMessage(raw)
          this.callHandlers(message)
        } catch (error) {
          console.error(error)
        }
      })
  }

  private onEnd() {
    this.emit('disconnected')

    this.socket?.destroy()
    this.eventHandlers.clear()

    if (this.terminating) return

    setTimeout(() => this.start(), 10_000)
  }

  private parseMessage(input: string) {
    const message = input.trim().split(' ')
    const params: string[] = []

    let prefix = ''
    let command = ''
    let text = ''

    if (message[0]!.startsWith(':')) {
      prefix = message[0]!
      message.shift()
    }

    command = message[0]!
    message.shift()

    for (let i = 0; i < message.length; i++) {
      const token = message[i]
      if (token!.startsWith(':')) {
        text = message.slice(i).join(' ').substring(1)
        break
      }

      params.push(token!)
    }

    return { prefix, command, params, text }
  }

  private callHandlers = (message: Message) => {
    const handlers = this.eventHandlers.get(message.command)
    if (!handlers) return

    const params = { send: this.send.bind(this), message, config: this.config }
    for (const handler of handlers) {
      handler(params).catch((error) => console.error(error))
    }
  }
}
