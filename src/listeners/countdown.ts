import { raweceekClient } from '../api/raweceek-client'
import { IEventContext } from '../types/irc'

export const handleCountdown = (context: IEventContext) => {
  if (!context.message.isChannel()) return

  if (context.message.text.command() !== '!!n') return

  raweceekClient.fetchCountdown().then((response) => {
    if (!response) return

    const countdown = timeUntil(response.session.startTime)
    if (!countdown) return

    const text = `${response.session.summary} begins in ${countdown} at ${response.session.startTime}`
    context.send(`PRIVMSG ${context.message.params[0]} :${text} 🎉`)
  })
}

const timeUntil = (targetDate: string): string | null => {
  const difference = new Date(targetDate).getTime() - new Date().getTime()
  if (difference <= 0) return null

  const seconds = Math.floor((difference / 1000) % 60)
  const minutes = Math.floor((difference / (1000 * 60)) % 60)
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 30)

  const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24))
  const months = Math.floor(totalDays / 30)
  const weeks = Math.floor((totalDays % 30) / 7)

  let result = ''
  if (months > 0) result += `${months} month${months > 1 ? 's' : ''} `
  if (weeks > 0) result += `${weeks} week${weeks > 1 ? 's' : ''} `
  if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `
  if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `
  if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''} `
  result += `${seconds} second${seconds > 1 ? 's' : ''}`

  return result
}
