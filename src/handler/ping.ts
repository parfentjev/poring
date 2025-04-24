import { EventContext } from '../types/irc'

export const handlePing = (event: EventContext) => {
  event.send(`PONG :${event.message.text}`)
}
