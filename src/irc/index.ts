import { connect as tlsConnect, TLSSocket } from 'tls'
import Config from '../types/config'
import { IEventHandler } from '../types/irc'
import SaslAuthenticator from './sasl'
import { parseMessage } from './message'

class IRCBot {
  config: Config
  socket!: TLSSocket
  handlers = new Map<string, IEventHandler[]>()

  constructor(config: Config) {
    this.config = config
  }

  connect() {
    this.socket = tlsConnect({
      host: this.config.server.host,
      port: this.config.server.port,
    })

    this.socket.on('data', (data: Buffer) => this.read(data))
    this.socket.on('end', () => this.connect())

    if (this.config.sasl.enabled) new SaslAuthenticator(this, this.joinChannels.bind(this)).handle()
    this.send(`NICK ${this.config.server.nickname}`)
    this.send('USER poring 0 * :https://codeberg.org/parfentjev/poring')
    if (!this.config.sasl.enabled) this.joinChannels()
  }

  handle(command: string, handler: IEventHandler) {
    const commandHandlers = this.handlers.get(command) ?? []
    commandHandlers.push(handler)
    this.handlers.set(command, commandHandlers)
  }

  send(message: string) {
    console.log(`<= ${message}`)
    this.socket.write(`${message}\r\n`)
  }

  private read(data: Buffer) {
    data
      .toString()
      .trim()
      .split('\r\n')
      .forEach((raw) => {
        console.log(`=> ${raw}`)

        const message = parseMessage(raw)
        this.handlers.get(message.command)?.forEach((handler) => {
          handler({
            send: this.send.bind(this),
            message,
            config: this.config,
          })
        })
      })
  }

  private joinChannels() {
    this.config.server.channels.forEach((channel) => this.send(`JOIN ${channel}`))
  }
}

export default IRCBot
