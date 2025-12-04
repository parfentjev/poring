import { config } from './config'
import { registerListeners } from './listeners'
import { IRCClient } from './irc'

const bot = new IRCClient(config)
bot.on('bot.connecting', () => registerListeners(bot))
bot.start()

process.on('SIGTERM', () => bot.stop())
