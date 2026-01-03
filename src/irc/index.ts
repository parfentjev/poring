import { TLSSocket } from 'tls'

import { connect } from 'tls'
import type { Config } from '../types/config'
import { EventManager } from './events'
import { SaslAuthenticator } from './authenticator'
import type { IrcClientContext, IrcEventContext } from '../types/irc'
import { TZDateClock } from '../utils/clock'

const repositoryUrl = 'https://github.com/parfentjev/poring'

export class IrcClient {
  private socket: TLSSocket | undefined
  private authenticator: SaslAuthenticator
  private terminating = false

  constructor(
    readonly config: Config,
    private ircEventManager: EventManager<IrcEventContext>,
    private clientEventManager: EventManager<IrcClientContext>
  ) {
    this.send = this.send.bind(this)
    this.authenticator = new SaslAuthenticator(this.ircEventManager, this.send)
  }

  start = () => {
    this.socket = connect({
      host: this.config.server.host,
      port: this.config.server.port,
    })

    this.clientEventManager.emit('connecting', this.context())

    this.socket.on('data', this.onData.bind(this))
    this.socket.on('end', this.onEnd.bind(this))

    if (this.config.user.sasl.enabled) {
      this.authenticator.authenticate()
    }

    this.send(`NICK ${this.config.user.nickname}`)
    this.send(`USER poring 0 * :${repositoryUrl}`)
  }

  stop = () => {
    this.terminating = true
    this.send(`QUIT :${repositoryUrl}`)
  }

  context = () => {
    return <IrcClientContext>{
      send: this.send,
      config: this.config,
    }
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
          const context = { send: this.send, message, config: this.config, clock: TZDateClock.getInstance() }
          this.ircEventManager.emit(message.command, context)
        } catch (error) {
          console.error(error)
        }
      })
  }

  private onEnd() {
    this.socket?.destroy()

    if (this.terminating) return

    this.clientEventManager.emit('disconnected', this.context())
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
