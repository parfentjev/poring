import type { CronJobManager, EventManager } from '../irc/events'
import type { IdleRpgConfig } from '../types/config'
import type { CronJobContext, IrcEventContext } from '../types/irc'

export const registerIdleRpg = (
  config: IdleRpgConfig,
  ircEventManager: EventManager<IrcEventContext>,
  cronJobManager: CronJobManager
) => {
  if (!config.isValid()) {
    console.info('IdleRpgConfig is empty, skip idlerpg.ts')
    return
  }

  ircEventManager.on('353', idleRpgHandler)
  cronJobManager.on(config.cron!, idleRpgJob)
}

export const idleRpgJob = async (context: CronJobContext) => {
  context.send(`NAMES ${context.config.idleRpg.channel}`)
}

export const idleRpgHandler = async (context: IrcEventContext) => {
  const { params, text } = context.message
  const config = context.config.listener.idleRpg

  // channel name is always the final param
  if (params[params.length - 1] !== config.channel) return

  // users with a voice flag are logged in - all is good
  if (text.includes(`+${config.player}`)) return

  context.send(`PRIVMSG ${config.target} :${config.notification}`)
}
