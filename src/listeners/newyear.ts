import { TZDate } from '@date-fns/tz'
import type { IrcEventContext } from '../types/irc'
import { getDaysInYear, isValid } from 'date-fns'
import type { Clock } from '../types/utils'

const DEFAULT_OFFSET = '+00:00'

const SECOND = 1000
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

const MS_IN_DAY = 8.64e7

export const newYearHandler = async (context: IrcEventContext) => {
  const messageText = context.message.text
  if (!messageText.startsWith('!newyear') && !messageText.startsWith('!ny')) return

  const offset = getOffset(messageText)
  const { diff } = getDatesByOffset(context.clock, offset)

  const days = Math.floor(diff / DAY)
  const hours = Math.floor((diff % DAY) / HOUR)
  const minutes = Math.floor((diff % HOUR) / MINUTE)
  const seconds = Math.floor((diff % MINUTE) / SECOND)

  const response = `It's only ${days}d ${hours}h ${minutes}m ${seconds}s left until the \x02new year\x02! 🎄☃️🎉`
  context.send(`PRIVMSG ${context.message.params[0]} :${response}`)
}

export const yearProgressHandler = async (context: IrcEventContext) => {
  const messageText = context.message.text
  if (!messageText.startsWith('!year')) return

  const offset = getOffset(messageText)
  const { now, diff } = getDatesByOffset(context.clock, offset)

  const yearLength = getDaysInYear(now) * MS_IN_DAY
  const progress = Math.min(100 - (diff / yearLength) * 100, 99.99).toFixed(2)

  const response = `Year ${now.getFullYear()} progress: \x02${progress}%\x02 👀🚧💃`
  context.send(`PRIVMSG ${context.message.params[0]} :${response}`)
}

const getOffset = (messageText: string) => {
  const request = messageText.split(' ')

  let offset = DEFAULT_OFFSET
  if (request.length === 2) offset = parseOffset(request[1]!)

  return offset
}

const getDatesByOffset = (clock: Clock, offset: string) => {
  let now = clock.now(offset)
  let newYear = new TZDate(now.getFullYear() + 1, 0, 1, 0, 0, offset)

  if (!isValid(now) || !isValid(newYear)) {
    now = clock.now(DEFAULT_OFFSET)
    newYear = new TZDate(now.getFullYear() + 1, 0, 1, 0, 0, DEFAULT_OFFSET)
  }

  return { now, newYear, diff: newYear.valueOf() - now.valueOf() }
}

const parseOffset = (input: string) => {
  const sign = (() => {
    switch (input.charAt(0)) {
      case '+':
      case '-': {
        const sign = input.charAt(0)
        input = input.slice(1)
        return sign
      }
      default: {
        return '+'
      }
    }
  })()

  let hours = '0'
  let minutes = '0'

  if (input.includes(':')) {
    const dividerIndex = input.indexOf(':')
    hours = input.slice(0, dividerIndex)
    minutes = input.slice(dividerIndex + 1)
  } else {
    hours = input
  }

  return `${sign}${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}
