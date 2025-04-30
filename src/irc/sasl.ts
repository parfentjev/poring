import { IRCBot } from '.'
import { IEventContext } from '../types/irc'

type State = 'idle' | 'requested' | 'authPlain' | 'authPassword'

export class SaslAuthenticator {
  constructor(public bot: IRCBot, public onSuccess: Function, private state: State = 'idle') {}

  handle = () => {
    this.bot.addEventListener('CAP', this.handleCap)
    this.bot.addEventListener('AUTHENTICATE', this.handleAuth)
    this.bot.addEventListener('903', this.handleAuthSuccess)

    this.state = 'requested'
    this.bot.send('CAP REQ :sasl')

    setInterval(() => (this.state = 'idle'), 60000)
  }

  private handleCap = (context: IEventContext) => {
    if (this.state != 'requested') return

    if (
      context.message.params.length === 2 &&
      context.message.params[1] === 'ACK' &&
      context.message.text.value === 'sasl'
    ) {
      this.state = 'authPlain'
      context.send('AUTHENTICATE PLAIN')
    } else {
      console.error('Authentication failed.')
    }
  }

  private handleAuth = (context: IEventContext) => {
    if (this.state != 'authPlain') return

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
    this.state = 'idle'
    context.send('CAP END')
    this.onSuccess()
  }
}
