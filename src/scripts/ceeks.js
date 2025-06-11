import { raweceekClient } from './api/raweceek-client.js'

export const config = {
  type: 'eventHandler',
  event: 'PRIVMSG'
}

const commandUnitMap = new Map([
  ['!ceeks', 'ceeks'],
  ['!supermax', 'super maxes'],
  ['!dogs', 'dog years'],
  ['!blinks', 'eye blinks'],
])

export const eventHandler = async (context) => {
  if (!context.message.isChannel()) return

  const unit = commandUnitMap.get(context.message.text.command())
  if (!unit) return

  raweceekClient.sessionsCountdown('f1').then((response) => {
    if (!response) return

    response.countdowns
      .filter((countdown) => countdown.unit === unit)
      .forEach((countdown) => {
        const value = countdown.value.toFixed(2)
        const text = `\x02${response.session.summary}\x02 begins in ${value} ${countdown.unit} at ${response.session.startTime}`

        context.send(`PRIVMSG ${context.message.params[0]} :${text} 🎉`)
      })
  })
}
