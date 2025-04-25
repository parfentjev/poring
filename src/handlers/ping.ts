import { IEventContext } from '../types/irc'

export const handlePing = (context: IEventContext) => {
  context.send(`PONG :${context.message.text.value}`)
}
