import type { IrcEventContext } from '../types/irc'

type NextSessionResponse = {
  summary: string
  location: string
  startTime: string
  thisWeek: boolean
  countdowns: { type: string; value: string }[]
}

export const ceeksHandler = async (context: IrcEventContext) => {
  const config = context.config.listener.raweCeek
  if (!config.isEnabled()) return

  const target = context.message.params[0]
  if (context.message.text !== '!ceeks') return

  const response = await fetch(`${config.url}/api/next-session`)
  if (!response || response.status !== 200) return

  const body = (await response.json()) as NextSessionResponse
  const ceeks = body.countdowns.find((c) => c.type === 'CEEKS')
  if (!ceeks) return

  const text = `\x02${body.summary}\x02 begins in ${ceeks.value} 🎉`
  context.send(`PRIVMSG ${target} :${text}`)
}
