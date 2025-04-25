import IRCBot from '../irc'
import { IConfig } from '../types/config'
import { handleNext } from './next'
import { handlePing } from './ping'
import { handlePoring } from './poring'
import { handleCeeks } from './raweceek'

export const registerHandlers = (config: IConfig, bot: IRCBot) => {
  bot.handle('PING', handlePing)
  bot.handle('PRIVMSG', handleCeeks)
  bot.cronSchedule(handleNext, config.handler.next.cron)
  bot.timerSchedule(handlePoring, config.handler.poring.timerRangeStart, config.handler.poring.timerRangeEnd)
}
