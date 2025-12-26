import { CronJob } from 'cron'
import type { CronJobContext, EventHandler } from '../types/irc'

export class EventManager<T> {
  private listeners: Map<string, EventHandler<T>[]>

  constructor() {
    this.listeners = new Map()
  }

  on = (event: string, handler: EventHandler<T>) => {
    const handlers = this.listeners.get(event) ?? []
    handlers.push(handler)

    this.listeners.set(event, handlers)
  }

  emit = (event: string, context: T) => {
    const handlers = this.listeners.get(event)
    if (!handlers || handlers.length === 0) return

    for (const handler of handlers) {
      handler(context).catch((error) => console.error(error))
    }
  }
}

export class CronJobManager {
  constructor(private contextProvider: () => CronJobContext) {}

  on = (cronTime: string, handler: EventHandler<CronJobContext>) => {
    const job = new CronJob(cronTime, () => handler(this.contextProvider()).catch((error) => console.error(error)))
    job.start()
  }
}
