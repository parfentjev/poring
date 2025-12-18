import { connectedHandler, pingHandler } from './core'
import { ceeksHandler } from './raweceek'
import { rssHandler } from './freshrss'
import type { EventManager } from '../irc/events'

export const registerListeners = (manager: EventManager) => {
  manager.onIrc('001', connectedHandler)
  manager.onIrc('PING', pingHandler)
  manager.onIrc('PRIVMSG', ceeksHandler)

  // the feed is refreshed twice per hour (3, 33) - run after that
  manager.onCron('5,35 * * * *', rssHandler)
}
