export const config = {
  type: 'timerJob',
  timer: {
    id: 'random-actions',
    timerRangeStart: 1,
    timerRangeEnd: 5,
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
