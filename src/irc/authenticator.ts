import type { IRCClient } from '.'
import type { SASLConfig } from '../types/config'
import type { EventContext } from '../types/irc'

export class SASLAuthenticator {
  constructor(private client: IRCClient, private config: SASLConfig) {}

  start() {
    this.client.addEventHandler('CAP', this.handleCap.bind(this))
    this.client.addEventHandler('AUTHENTICATE', this.handleAuth.bind(this))
    this.client.addEventHandler('903', this.handleAuthSuccess.bind(this))

    this.client.send('CAP REQ :sasl')
  }

  private async handleCap(context: EventContext) {
    if (context.message.params.length === 2 && context.message.params[1] === 'ACK' && context.message.text === 'sasl') {
      context.send('AUTHENTICATE PLAIN')
    }
  }

  private async handleAuth(context: EventContext) {
    if (context.message.params.length > 0 && context.message.params[0] === '+') {
      const data = Buffer.concat([
        Buffer.from('\x00'),
        Buffer.from(this.config.username ?? ''),
        Buffer.from('\x00'),
        Buffer.from(this.config.password ?? ''),
      ]).toString('base64')

      context.send(`AUTHENTICATE ${data}`)
    }
  }

  private async handleAuthSuccess(context: EventContext) {
    context.send('CAP END')
  }
}
