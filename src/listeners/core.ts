import type { IrcEventContext } from '../types/irc'

export const pingHandler = async (context: IrcEventContext) => {
  context.send(`PONG :${context.message.text}`)
}

export const connectedHandler = async (context: IrcEventContext) => {
  context.config.user.channels.forEach((channel) => context.send(`JOIN ${channel}`))
}
