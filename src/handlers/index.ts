import type { EventHandler } from '../types/irc'
import { connectedHandler, pingHandler } from './core'
import { ceeksHandler } from './raweceek'

export const registerHandlers = (register: (event: string, handler: EventHandler) => void) => {
  register('001', connectedHandler)
  register('PING', pingHandler)
  register('PRIVMSG', ceeksHandler)
}
