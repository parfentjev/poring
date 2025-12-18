import { TLSSocket } from 'tls'

import { connect } from 'tls'
import type { Config } from '../types/config'
import { EventManager } from './events'
import { SaslAuthenticator } from './authenticator'

const repositoryUrl = 'https://github.com/parfentjev/poring'

export class IrcClient {
  private socket: TLSSocket | undefined
  readonly eventManager: EventManager
  private authenticator: SaslAuthenticator
  private terminating = false

  constructor(readonly config: Config) {
    this.send = this.send.bind(this)

    this.eventManager = new EventManager(this.config.listener, this.send)
    this.authenticator = new SaslAuthenticator(this.eventManager, this.send)
  }

  start() {
    this.socket = connect({
      host: this.config.server.host,
      port: this.config.server.port,
    })

    this.eventManager.emitClient('connecting')

    this.socket.on('data', this.onData.bind(this))
    this.socket.on('end', this.onEnd.bind(this))

    if (this.config.user.sasl.enabled) {
      this.authenticator.authenticate()
    }

    this.send(`NICK ${this.config.user.nickname}`)
    this.send(`USER poring 0 * :${repositoryUrl}`)
  }

  stop() {
    this.terminating = true
    this.send(`QUIT :${repositoryUrl}`)
  }

  private send = (message: string) => {
    if (!this.socket || this.socket.closed) return

    console.log(`<= ${message}`)
    this.socket.write(`${message}\r\n`)
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
          const context = { send: this.send, message, config: this.config }
          this.eventManager.emitIrc(message.command, context)
        } catch (error) {
          console.error(error)
        }
      })
  }

  private onEnd() {
    this.socket?.destroy()

    if (this.terminating) return

    this.eventManager.emitClient('disconnected')
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
}
