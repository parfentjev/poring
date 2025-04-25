import { RaweCeekResponse } from '../types/handler'
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

  fetchCountdown().then((response) => {
    if (!response) return

    response.countdowns
      .filter((countdown) => countdown.unit === unit)
      .forEach((countdown) => {
        const text = `${response.session.summary} begins in ${countdown.value.toFixed(2)} ${countdown.unit}`

        context.send(`PRIVMSG ${context.message.params[0]} :${text}🎉`)
      })
  })
}

const fetchCountdown = async (): Promise<RaweCeekResponse> => {
  return fetch('https://raweceek.eu/api/sessions/countdown')
    .then((response) => response.json())
    .catch(() => null)
}
