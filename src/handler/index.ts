import IRCBot from '../irc'
import Config from '../types/config'
import { handlePing } from './ping'

export const registerHandlers = (config: Config, bot: IRCBot) => {
  bot.handle('PING', handlePing)
}
