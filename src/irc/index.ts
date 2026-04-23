import { TLSSocket } from 'tls'

import { connect } from 'tls'
import type { Config } from '../types/config'
import { EventManager } from './events'
import { SaslAuthenticator } from './authenticator'
import type { IrcClientContext, IrcEventContext } from '../types/irc'
import { tzDateClock } from '../utils/clock'

const repositoryUrl = 'https://github.com/parfentjev/poring'

export class IrcClient {
  private socket: TLSSocket | undefined
  private authenticator: SaslAuthenticator
  private terminating = false
  private buffer = ''

  constructor(
    readonly config: Config,
    private ircEventManager: EventManager<IrcEventContext>,
    private clientEventManager: EventManager<IrcClientContext>
  ) {
    this.send = this.send.bind(this)
    this.authenticator = new SaslAuthenticator(this.ircEventManager, this.send)
  }

  start = () => {
    const socket = connect({
      host: this.config.server.host,
      port: this.config.server.port,
    })

    this.socket = socket
    this.clientEventManager.emit('connecting', this.context())

    socket.on('data', this.onData.bind(this))
    socket.on('end', this.onEnd.bind(this))

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
    this.readLines(data).forEach((line) => {
      console.log(`=> ${line}`)

      try {
        const message = this.parseMessage(line)
        const context = { send: this.send, message, config: this.config, clock: tzDateClock }
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

  private readLines(data: Buffer) {
    // A message may be split across multiple data events, so incoming data
    // is appended to a buffer before splitting. Any incomplete message at
    // the end of the buffer is held in the buffer until the next chunk arrives,
    // at which point it will be reassembled into a complete line.
    this.buffer += data.toString()
    const lines = this.buffer.split('\r\n')

    // Removes the last element from an array and returns it,
    // which is either an empty string or an incomplete message
    // that wasn't terminated.
    this.buffer = lines.pop() ?? ''

    return lines
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
