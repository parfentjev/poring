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
  clientEventManager: EventManager<IrcClientContext>,
  cronJobManager: CronJobManager
) => {
  clientEventManager.on('connecting', async (context: IrcClientContext) => {
    const server = context.config.server
    console.log(`Connecting to ${server.host}:${server.port}`)
  })

  clientEventManager.on('disconnected', async (context: IrcClientContext) => {
    const server = context.config.server
    console.log(`Disconnected from ${server.host}:${server.port}`)
  })

  ircEventManager.on('001', connectedHandler)
  ircEventManager.on('PING', pingHandler)
  ircEventManager.on('PRIVMSG', ceeksHandler)
  ircEventManager.on('PRIVMSG', newYearHandler)
  ircEventManager.on('PRIVMSG', yearProgressHandler)

  registerFreshRss(config.freshRss, cronJobManager)
  registerIdleRpg(config.idleRpg, ircEventManager, cronJobManager)
}
