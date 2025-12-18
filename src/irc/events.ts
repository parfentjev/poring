import { CronJob } from 'cron'
import type { ClientEventHandler, CronEventHandler, IrcEventContext, IrcEventHandler, SendFunction } from '../types/irc'
import type { ListenerConfig } from '../types/config'

export class EventManager {
  private ircEventListeners: Map<string, IrcEventHandler[]>
  private clientEventListeners: Map<string, ClientEventHandler[]>
  private cronJobs: CronJob[] = []

  constructor(private config: ListenerConfig, private send: SendFunction) {
    this.ircEventListeners = new Map()
    this.clientEventListeners = new Map()
    this.cronJobs = []
  }

  emitIrc(command: string, context: IrcEventContext) {
    const listeners = this.ircEventListeners.get(command)
    if (!listeners || listeners.length === 0) return

    for (const listener of listeners) {
      listener(context).catch((error) => console.error(error))
    }
  }

  emitClient(event: string) {
    const listeners = this.clientEventListeners.get(event)
    if (!listeners || listeners.length === 0) return

    for (const listener of listeners) {
      listener().catch((error) => console.error(error))
    }
  }

  onIrc(command: string, handler: IrcEventHandler) {
    const handlers = this.ircEventListeners.get(command) ?? []
    handlers.push(handler)

    this.ircEventListeners.set(command, handlers)
  }

  onClient(event: string, handler: ClientEventHandler) {
    const handlers = this.clientEventListeners.get(event) ?? []
    handlers.push(handler)

    this.clientEventListeners.set(event, handlers)
  }

  onCron(cronTime: string, handler: CronEventHandler) {
    const context = { send: this.send, config: this.config }
    const job = new CronJob(cronTime, () => handler(context).catch((error) => console.error(error)))
    job.start()

    this.cronJobs.push(job)
  }
}
