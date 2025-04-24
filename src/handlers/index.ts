import IRCBot from '../irc'
import Config from '../types/config'
import { handlePing } from './ping'
import { handleCeeks } from './raweceek'

export const registerHandlers = (config: Config, bot: IRCBot) => {
  bot.handle('PING', handlePing)
  bot.handle('PRIVMSG', handleCeeks)
  // todo: handle next
  // todo: handle poring
}
