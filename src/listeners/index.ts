import { connectedHandler, pingHandler } from './core'
import { ceeksHandler } from './raweceek'
import type { CronJobManager, EventManager } from '../irc/events'
import type { IrcClientContext, IrcEventContext } from '../types/irc'
import { registerFreshRss } from './freshrss'
import { newYearHandler, yearProgressHandler } from './newyear'
import type { ListenerConfig } from '../types/config'
import { registerIdleRpg } from './idlerpg'

export const registerListeners = (
  config: ListenerConfig,
  ircEventManager: EventManager<IrcEventContext>,
  _clientEventManager: EventManager<IrcClientContext>,
  cronJobManager: CronJobManager
) => {
  ircEventManager.on('001', connectedHandler)
  ircEventManager.on('PING', pingHandler)
  ircEventManager.on('PRIVMSG', ceeksHandler)
  ircEventManager.on('PRIVMSG', newYearHandler)
  ircEventManager.on('PRIVMSG', yearProgressHandler)

  registerFreshRss(config.freshRss, cronJobManager)
  registerIdleRpg(config.idleRpg, ircEventManager, cronJobManager)
}
