import { connect as tlsConnect, TLSSocket } from 'tls'
import { IConfig, ICronHandlerConfig, ITimerHandlerConfig } from '../types/config'
import { IEventHandler, IIRCBot, IScheduleHandler, IScheduler } from '../types/irc'
import { SaslAuthenticator } from './sasl'
import { parseMessage } from './message'
import { CronJob } from 'cron'
import { IStorage, IStorageTimer } from '../types/storage'
import { Scheduler } from './scheduler'

export class IRCBot implements IIRCBot {
  constructor(
    private config: IConfig,
    private storage: IStorage,
    private socket: TLSSocket | null = null,
    private handlers = new Map<string, IEventHandler[]>(),
    private scheduler: IScheduler = new Scheduler(this.send, config, storage)
  ) {}

  connect = () => {
    this.socket = tlsConnect({
      host: this.config.server.host,
      port: this.config.server.port,
    })

    this.socket.on('data', (data) => this.read(data))
    this.socket.on('end', () => this.connect())

    if (this.config.sasl.enabled) new SaslAuthenticator(this, this.joinChannels).handle()
    this.send(`NICK ${this.config.server.nickname}`)
    this.send('USER poring 0 * :https://codeberg.org/parfentjev/poring')
    if (!this.config.sasl.enabled) this.joinChannels()
  }

  send = (message: string) => {
    if (!this.socket) return

    console.log(`<= ${message}`)
    this.socket.write(`${message}\r\n`)
  }

  addEventListener = (event: string, handler: IEventHandler) => {
    const commandHandlers = this.handlers.get(event) ?? []
    commandHandlers.push(handler)
    this.handlers.set(event, commandHandlers)
  }

  addCronJob = (handler: IScheduleHandler, config: ICronHandlerConfig) => {
    this.scheduler.addCronJob(handler, config)
  }

  addTimerJob = (handler: IScheduleHandler, config: ITimerHandlerConfig) => {
    this.scheduler.addTimerJob(handler, config)
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
