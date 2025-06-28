import { connect as tlsConnect, TLSSocket } from 'tls'
import { Config } from '../types/config'
import { EventHandler, IRCBot, Scheduler, ScriptManager } from '../types/irc'
import { DefaultSaslAuthenticator } from './sasl'
import { parseMessage } from './message'
import { Storage } from '../types/storage'
import { JobScheduler } from './scheduler'
import { LiveScriptManager } from './script'

export class PoringIRCBot implements IRCBot {
  constructor(
    private config: Config,
    private storage: Storage,
    private socket: TLSSocket | null = null,
    private handlers = new Map<string, EventHandler[]>(),
    private scheduler: Scheduler = new JobScheduler(this.send, config, storage),
    private scriptManager: ScriptManager | null = null
  ) {
    this.scriptManager = new LiveScriptManager(config.scripts.scriptsDirectory, this, this.scheduler)
  }

  connect = () => {
    this.socket = tlsConnect({
      host: this.config.server.host,
      port: this.config.server.port,
    })

    this.socket.on('data', (data) => this.read(data))
    this.socket.on('end', () => this.connect())

    if (this.config.sasl.enabled)
      new DefaultSaslAuthenticator(this, this.joinChannels, () => {
        throw new Error('SASL auth failed')
      }).handle()

    this.send(`NICK ${this.config.server.nickname}`)
    this.send('USER poring 0 * :https://codeberg.org/parfentjev/poring')

    if (!this.config.sasl.enabled) this.joinChannels()
  }

  send = (message: string) => {
    if (!this.socket) return

    console.log(`<= ${message}`)
    this.socket.write(`${message}\r\n`)
  }

  addEventListener = (event: string, handler: EventHandler) => {
    const commandHandlers = this.handlers.get(event) ?? []
    commandHandlers.push(handler)
    this.handlers.set(event, commandHandlers)
  }

  clearEventListeners = () => {
    this.handlers.clear()
  }

  private read = (data: Buffer) => {
    data
      .toString()
      .trim()
      .split('\r\n')
      .forEach((raw) => {
        console.log(`=> ${raw}`)

        const message = parseMessage(raw)
        this.handlers.get(message.command)?.forEach((handler) => {
          handler({
            send: this.send,
            message,
            config: this.config,
            storage: this.storage,
          })
        })
      })
  }

  private joinChannels = () => {
    this.config.server.channels.forEach((channel) => this.send(`JOIN ${channel}`))
  }
}
