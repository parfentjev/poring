import { IScheduleContext } from '../types/irc'

export const handleNext = (context: IScheduleContext) => {
  context.send(`PRIVMSG ${context.config.handler.next.channel} :!n`)
}
