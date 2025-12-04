import type { EventContext } from '../types/irc'

export const pingHandler = async (context: EventContext) => {
  context.send(`PONG :${context.message.text}`)
}

export const connectedHandler = async (context: EventContext) => {
  context.config.user.channels.forEach((channel) => context.send(`JOIN ${channel}`))
}
