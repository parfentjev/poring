import type { IrcEventContext, SendFunction } from '../types/irc'
import type { EventManager } from './events'

export class SaslAuthenticator {
  constructor(eventManager: EventManager, private send: SendFunction) {
    eventManager.onIrc('CAP', this.handleCap)
    eventManager.onIrc('AUTHENTICATE', this.handleAuth)
    eventManager.onIrc('903', this.handleAuthSuccess)
  }

  authenticate() {
    this.send('CAP REQ :sasl')
  }

  private async handleCap(context: IrcEventContext) {
    if (context.message.params.length === 2 && context.message.params[1] === 'ACK' && context.message.text === 'sasl') {
      context.send('AUTHENTICATE PLAIN')
    }
  }

  private async handleAuth(context: IrcEventContext) {
    if (context.message.params.length > 0 && context.message.params[0] === '+') {
      const data = Buffer.concat([
        Buffer.from('\x00'),
        Buffer.from(context.config.user.sasl.username ?? ''),
        Buffer.from('\x00'),
        Buffer.from(context.config.user.sasl.password ?? ''),
      ]).toString('base64')

      context.send(`AUTHENTICATE ${data}`)
    }
  }

  private async handleAuthSuccess(context: IrcEventContext) {
    context.send('CAP END')
  }
}
