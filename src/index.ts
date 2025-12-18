import { config } from './config'
import { registerListeners } from './listeners'
import { IrcClient } from './irc'

const bot = new IrcClient(config)
registerListeners(bot.eventManager)
bot.start()

process.on('SIGTERM', () => bot.stop())
