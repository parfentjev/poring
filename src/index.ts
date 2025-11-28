import { config } from './config'
import { registerHandlers } from './handlers'
import { IRCClient } from './irc'

const bot = new IRCClient(config)
bot.on('connecting', () => registerHandlers(bot.addEventHandler))
bot.start()

process.on('SIGTERM', () => bot.stop())
