import { IScheduleContext } from '../types/irc'

const messageCategory = 'random-actions'

export const handlePoring = (context: IScheduleContext) => {
  context.storage.getRandomMessage(messageCategory).then(async (message) => {
    if (!message) return

    context.send(`PRIVMSG ${context.config.handler.poring.channel} :\x01ACTION ${message.text}\x01`)
    await context.storage.increaseMessageUsageCount(message.id)
  })
}
