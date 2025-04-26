import { IRCBot } from '.'
import { IEventContext } from '../types/irc'

enum State {
  IDLE,
  REQUESTED,
  AUTH_PLAIN,
  AUTH_PASSWORD,
}

export class SaslAuthenticator {
  state = State.IDLE

  bot: IRCBot
  onSuccess!: Function

  constructor(bot: IRCBot, onSuccess: Function) {
    this.bot = bot
    this.onSuccess = onSuccess
  }

  handle = () => {
    this.bot.addEventListener('CAP', this.handleCap)
    this.bot.addEventListener('AUTHENTICATE', this.handleAuth)
    this.bot.addEventListener('903', this.handleAuthSuccess)

    this.state = State.REQUESTED
    this.bot.send('CAP REQ :sasl')

    setInterval(() => (this.state = State.IDLE), 60000)
  }

  private handleCap = (context: IEventContext) => {
    if (this.state != State.REQUESTED) return

    if (
      context.message.params.length === 2 &&
      context.message.params[1] === 'ACK' &&
      context.message.text.value === 'sasl'
    ) {
      this.state = State.AUTH_PLAIN
      context.send('AUTHENTICATE PLAIN')
    } else {
      console.error('Authentication failed.')
    }
  }

  private handleAuth = (context: IEventContext) => {
    if (this.state != State.AUTH_PLAIN) return

    if (context.message.params.length > 0 && context.message.params[0] === '+') {
      const data = Buffer.concat([
        Buffer.from('\x00'),
        Buffer.from(context.config.sasl.username),
        Buffer.from('\x00'),
        Buffer.from(context.config.sasl.password),
      ]).toString('base64')

      context.send(`AUTHENTICATE ${data}`)
    } else {
      console.log('Authentication failed.')
    }
  }

  private handleAuthSuccess = (context: IEventContext) => {
    this.state = State.IDLE
    context.send('CAP END')
    this.onSuccess()
  }
}
