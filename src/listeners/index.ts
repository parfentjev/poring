import { connectedHandler, pingHandler } from './core'
import { ceeksHandler } from './raweceek'
import type { CronJobManager, EventManager } from '../irc/events'
import type { IrcClientContext, IrcEventContext } from '../types/irc'
import { rssHandler } from './freshrss'

export const registerListeners = (
  ircEventManager: EventManager<IrcEventContext>,
  _clientEventManager: EventManager<IrcClientContext>,
  cronJobManager: CronJobManager
) => {
  ircEventManager.on('001', connectedHandler)
  ircEventManager.on('PING', pingHandler)
  ircEventManager.on('PRIVMSG', ceeksHandler)

  // the feed is refreshed twice per hour (8, 38) - run 5m after that
  cronJobManager.on('8,38 * * * *', rssHandler)
}
