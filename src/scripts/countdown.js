import { raweceekClient } from './api/raweceek-client.js'

export const config = {
  type: 'eventHandler',
  event: 'PRIVMSG'
}

export const eventHandler = (context) => {
  if (!context.message.isChannel()) return

  let series
  switch (context.message.text.command()) {
    case '!!n':
      series = 'f1'
      break
    case '!indy':
      series = 'indycar'
      break
    case '!moto':
      series = 'motogp'
      break
    default:
      return
  }

  raweceekClient.sessionsNext(series).then((response) => {
    if (!response) return

    const text = `\x02${response.summary}\x02 begins in ${response.timeUntil} at ${response.startTime}`
    context.send(`PRIVMSG ${context.message.params[0]} :${text} 🎉`)
  })
}
