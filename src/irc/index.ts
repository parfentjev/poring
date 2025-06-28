import { connect as tlsConnect, TLSSocket } from 'tls'
import { Config } from '../types/config'
import { EventHandler, IRCBot, Scheduler, ScriptManager } from '../types/irc'
import { DefaultSaslAuthenticator } from './sasl'
import { parseMessage } from './message'
import { Storage } from '../types/storage'
import { JobScheduler } from './scheduler'
import { LiveScriptManager } from './script'

export class PoringIRCBot implements IRCBot {
  private socket: TLSSocket | undefined
  private handlers: Map<string, EventHandler[]> | undefined
  private scheduler: Scheduler | undefined

  private constructor(private config: Config, private storage: Storage) {}

  static create(config: Config, storage: Storage) {
    const bot = new PoringIRCBot(config, storage)
    bot.handlers = new Map()
    bot.scheduler = new JobScheduler(bot.send, config, storage)
    new LiveScriptManager(config.scripts.scriptsDirectory, bot, bot.scheduler)

    return bot
  }

  static createWithDependencies = (dependencies: {
    config: Config
    storage: Storage
    socket?: TLSSocket
    handlers?: Map<string, EventHandler[]>
    scheduler?: Scheduler
  }) => {
    const bot = new PoringIRCBot(dependencies.config, dependencies.storage)

    if (dependencies.socket) {
      bot.socket = dependencies.socket
      bot.socket.on('data', (data) => bot.read(data))
    }

    bot.handlers = dependencies.handlers
    bot.scheduler = dependencies.scheduler

    return bot
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
    const commandHandlers = this.handlers?.get(event) ?? []
    commandHandlers.push(handler)
    this.handlers?.set(event, commandHandlers)
  }

  clearEventListeners = () => {
    this.handlers?.clear()
  }

  private read = (data: Buffer) => {
    data
      .toString()
      .trim()
      .split('\r\n')
      .forEach((raw) => {
        console.log(`=> ${raw}`)

        const message = parseMessage(raw)
        this.handlers?.get(message.command)?.forEach((handler) => {
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
