import type { EventContext, EventHandler } from '../types/irc'

export const registerHandlers = (register: (event: string, handler: EventHandler) => void) => {
  register('PING', pingHandler)
  register('PRIVMSG', ceeksHandler)
}

const pingHandler = (context: EventContext) => {
  context.send(`PONG :${context.message.text}`)
}

type NextSessionResponse = {
  summary: string
  location: string
  startTime: string
  thisWeek: boolean
  countdowns: { type: string; value: string }[]
}

const ceeksHandler = async (context: EventContext) => {
  const target = context.message.params[0]
  if (context.message.text !== '!ceeks') return

  const response = await fetch('https://raweceek.eu/api/next-session')
  if (!response || response.status !== 200) return

  const body = (await response.json()) as NextSessionResponse
  const ceeks = body.countdowns.find((c) => c.type === 'CEEKS')
  if (!ceeks) return

  const text = `\x02${body.summary}\x02 begins in ${ceeks.value} 🎉`
  context.send(`PRIVMSG ${target} :${text}`)
}

const prism = (text: string) => {
  const input = [...text]
  const output: string[] = []

  let colorIndex = Math.floor(Math.random() * 15)

  for (let char of input) {
    if (char === ' ') {
      output.push(char)
    } else {
      const colorCode = (colorIndex++ % 16).toString().padStart(2, '0')
      output.push(`\x03${colorCode}${char}`)
    }
  }

  return output.join('')
}
