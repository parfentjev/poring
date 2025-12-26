import { config } from './config'
import { registerListeners } from './listeners'
import { IrcClient } from './irc'
import { EventManager, CronJobManager } from './irc/events'
import { type IrcClientContext, type IrcEventContext } from './types/irc'

const ircEventManager = new EventManager<IrcEventContext>()
const clientEventManager = new EventManager<IrcClientContext>()
const ircClient = new IrcClient(config, ircEventManager, clientEventManager)

const cronJobManager = new CronJobManager(() => {
  const context = ircClient.context()

  return {
    send: context.send,
    config: context.config.listener,
  }
})

registerListeners(ircEventManager, clientEventManager, cronJobManager)
ircClient.start()

process.on('SIGTERM', () => ircClient.stop())
