import { TZDate } from '@date-fns/tz'
import type { IrcEventContext } from '../types/irc'
import { isValid } from 'date-fns'

const defaultOffset = '+00:00'

export const newYearHandler = async (context: IrcEventContext) => {
  const request = context.message.text.split(' ')
  if (request.length === 0) return

  const commands = ['!newyear', '!ny']
  if (!commands.includes(request[0]!)) return

  let offset = defaultOffset
  if (request.length === 2) offset = parseOffset(request[1]!)

  const now = TZDate.tz(offset)
  const target = new TZDate(now.getFullYear() + 1, 0, 1, 0, 0, offset)
  if (!isValid(now) || !isValid(target)) return

  const diff = target.valueOf() - now.valueOf()
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44)) // Average month length
  const weeks = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24 * 7))
  const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const response = `It's only ${months}mo ${weeks}w ${days}d ${hours}h ${minutes}m ${seconds}s left until the new year! 🎄☃️🎉`
  context.send(`PRIVMSG ${context.message.params[0]} :${response}`)
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

// for progress in %
//export const yearProgressHandler = async (context: IrcEventContext) => {}
