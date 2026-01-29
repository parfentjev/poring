import type { CronJobManager, EventManager } from '../irc/events'
import type { IdleRpgConfig } from '../types/config'
import type { CronJobContext, IrcEventContext } from '../types/irc'

class IdleRpgNotifier {
  private playerAuthenticated = false

  constructor(private config: IdleRpgConfig) {
    this.cronHandler = this.cronHandler.bind(this)
    this.namesHandler = this.namesHandler.bind(this)
    this.namesEndHandler = this.namesEndHandler.bind(this)
  }

  async cronHandler({ send }: CronJobContext) {
    this.playerAuthenticated = false
    send(`NAMES ${this.config.channel}`)
  }

  async namesHandler({ message }: IrcEventContext) {
    const { params, text } = message

    if (params[params.length - 1] !== this.config.channel) return

    if (text.includes(`+${this.config.player}`)) this.playerAuthenticated = true
  }

  async namesEndHandler({ message, send }: IrcEventContext) {
    if (message.params[1] !== this.config.channel) return

    if (this.playerAuthenticated) return

    send(`PRIVMSG ${this.config.target} :${this.config.notification}`)
  }
}

export const registerIdleRpg = (
  config: IdleRpgConfig,
  ircEventManager: EventManager<IrcEventContext>,
  cronJobManager: CronJobManager
) => {
  if (!config.isValid()) {
    console.info('IdleRpgConfig is empty, skip idlerpg.ts')
    return
  }

  const notifier = new IdleRpgNotifier(config)
  ircEventManager.on('353', notifier.namesHandler)
  ircEventManager.on('366', notifier.namesEndHandler)
  cronJobManager.on(config.cron!, notifier.cronHandler)
}
