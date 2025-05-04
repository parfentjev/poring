import { connect as tlsConnect, TLSSocket } from 'tls'
import { IConfig, ICronHandlerConfig, ITimerHandlerConfig } from '../types/config'
import { IEventHandler, IIRCBot, IScheduleHandler } from '../types/irc'
import { SaslAuthenticator } from './sasl'
import { parseMessage } from './message'
import { CronJob } from 'cron'
import { IStorage } from '../types/storage'

export class IRCBot implements IIRCBot {
  constructor(
    private config: IConfig,
    private storage: IStorage,
    private socket: TLSSocket | null = null,
    private handlers = new Map<string, IEventHandler[]>()
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
    new CronJob(
      config.cron,
      () => {
        handler({ send: this.send, config: this.config, storage: this.storage })
      },
      null,
      true,
      'Etc/UTC'
    )
  }

  addTimerJob = (handler: IScheduleHandler, config: ITimerHandlerConfig) => {
    const run = () => {
      // Convert range boundaries from minutes to milliseconds
      const minDuration = config.timerRangeStart * 60 * 1000
      const maxDuration = config.timerRangeEnd * 60 * 1000
      const randomDuration = minDuration + Math.floor(Math.random() * (maxDuration - minDuration))

      setTimeout(() => {
        handler({ send: this.send, config: this.config, storage: this.storage })
        run()
      }, randomDuration)
    }

    run()
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
