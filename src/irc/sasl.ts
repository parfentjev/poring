import IRCBot from '.'
import { EventContext } from '../types/irc'

enum State {
  IDLE,
  REQUESTED,
  AUTH_PLAIN,
  AUTH_PASSWORD,
}

class SaslAuthenticator {
  state = State.IDLE

  bot: IRCBot
  onSuccess!: Function

  constructor(bot: IRCBot, onSuccess: Function) {
    this.bot = bot
    this.onSuccess = onSuccess
  }

  handle = () => {
    this.bot.handle('CAP', this.handleCap)
    this.bot.handle('AUTHENTICATE', this.handleAuth)
    this.bot.handle('903', this.handleAuthSuccess)

    this.state = State.REQUESTED
    this.bot.send('CAP REQ :sasl')

    setInterval(() => (this.state = State.IDLE), 60000)
  }

  private handleCap = (event: EventContext) => {
    if (this.state != State.REQUESTED) return

    if (event.message.params.length === 2 && event.message.params[1] === 'ACK' && event.message.text === 'sasl') {
      this.state = State.AUTH_PLAIN
      event.send('AUTHENTICATE PLAIN')
    } else {
      console.error('Authentication failed.')
    }
  }

  private handleAuth = (event: EventContext) => {
    if (this.state != State.AUTH_PLAIN) return

    if (event.message.params.length > 0 && event.message.params[0] === '+') {
      const data = Buffer.concat([
        Buffer.from('\x00'),
        Buffer.from(event.config.sasl.username),
        Buffer.from('\x00'),
        Buffer.from(event.config.sasl.password),
      ]).toString('base64')

      event.send(`AUTHENTICATE ${data}`)
    } else {
      console.log('Authentication failed.')
    }
  }

  private handleAuthSuccess = (event: EventContext) => {
    this.state = State.IDLE
    event.send('CAP END')
    this.onSuccess()
  }
}

export default SaslAuthenticator
