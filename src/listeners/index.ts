import type { IRCClient } from '../irc'
import type { EventContext, EventHandler, IRCEvent } from '../types/irc'
import { connectedHandler, pingHandler } from './core'
import { ceeksHandler } from './raweceek'

export const registerListeners = (client: IRCClient) => {
  const on = (event: keyof IRCEvent, handler: EventHandler) => {
    client.on(event, (context: EventContext) => {
      handler(context).catch((error) => console.log(error))
    })
  }

  on('irc.001', connectedHandler)
  on('irc.PING', pingHandler)
  on('irc.PRIVMSG', ceeksHandler)
}
