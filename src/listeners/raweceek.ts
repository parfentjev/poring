import { raweceekClient } from '../api/raweceek-client'
import { IEventContext } from '../types/irc'

const commandUnitMap = new Map([
  ['!ceeks', 'ceeks'],
  ['!supermax', 'super maxes'],
  ['!dogs', 'dog years'],
  ['!blinks', 'eye blinks'],
])

export const handleCeeks = (context: IEventContext) => {
  if (!context.message.isChannel()) return

  const unit = commandUnitMap.get(context.message.text.command())
  if (!unit) return

  raweceekClient.sessionsCountdown('f1').then((response) => {
    if (!response) return

    response.countdowns
      .filter((countdown) => countdown.unit === unit)
      .forEach((countdown) => {
        const text = `\x02${response.session.summary}\x02 begins in ${countdown.value.toFixed(2)} ${
          countdown.unit
        } at ${response.session.startTime}`

        context.send(`PRIVMSG ${context.message.params[0]} :${text} 🎉`)
      })
  })
}

export const handleCountdown = (context: IEventContext) => {
  if (!context.message.isChannel()) return

  let series: string
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
