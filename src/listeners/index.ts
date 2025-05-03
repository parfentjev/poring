import { IRCBot } from '../irc'
import { IConfig } from '../types/config'
import { handleNext } from './next'
import { handlePing } from './ping'
import { handlePoring } from './poring'
import { handleCeeks, handleCountdown } from './raweceek'

export const addListeners = (config: IConfig, bot: IRCBot) => {
  bot.addEventListener('PING', handlePing)
  bot.addEventListener('PRIVMSG', handleCeeks)
  bot.addEventListener('PRIVMSG', handleCountdown)
  bot.addCronJob(handleNext, config.handler.next)
  bot.addTimerJob(handlePoring, config.handler.poring)
}
