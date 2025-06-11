export const config = {
  type: 'cronJob',
  cron: {
    expression: '*/5 * * * *',
  },
}

const messageCategory = 'random-actions'
const channel = '#prontera_field'

export const scheduleHandler = (context) => {
  context.storage.getRandomMessage(messageCategory).then(async (message) => {
    if (!message) return

    context.send(`PRIVMSG ${channel} :\x01ACTION ${message.text}\x01`)
    await context.storage.increaseMessageUsageCount(message.id)
  })
}
