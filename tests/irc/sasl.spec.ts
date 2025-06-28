import { expect } from 'chai'
import { IRCBotMock } from '../mocks/irc'
import { DefaultSaslAuthenticator } from '../../src/irc/sasl'

describe('Sasl', () => {
  describe('SaslAuthenticator', () => {
    it('auth flow success', () => {
      let success = false

      const bot = new IRCBotMock()
      const sasl = new DefaultSaslAuthenticator(
        bot,
        () => (success = true),
        () => {}
      )

      sasl.handle()
      expect(bot.messages).to.contain('CAP REQ :sasl')

      bot.mockMessage(':silver.libera.chat CAP * ACK :sasl')
      expect(bot.messages).to.contain('AUTHENTICATE PLAIN')

      bot.mockMessage('AUTHENTICATE +')
      expect(bot.messages).to.contain('AUTHENTICATE AHBvcmluZwB0ZXN0')

      bot.mockMessage(':silver.libera.chat 903 poring-dev :SASL authentication successful')
      expect(bot.messages).to.contain('CAP END')
      expect(success).to.be.true
    })

    it('handleCap too many params', () => {
      let failure = false

      const bot = new IRCBotMock()
      const sasl = new DefaultSaslAuthenticator(
        bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      bot.mockMessage(':silver.libera.chat CAP * ACK EXTRA :sasl')
      expect(failure).to.be.true
    })

    it('handleCap invalid param name', () => {
      let failure = false

      const bot = new IRCBotMock()
      const sasl = new DefaultSaslAuthenticator(
        bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      bot.mockMessage(':silver.libera.chat CAP * INVALID :sasl')
      expect(failure).to.be.true
    })

    it('handleCap invalid auth method', () => {
      let failure = false

      const bot = new IRCBotMock()
      const sasl = new DefaultSaslAuthenticator(
        bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      bot.mockMessage(':silver.libera.chat CAP * ACK :notSasl')
      expect(failure).to.be.true
    })

    it('handleAuth no params', () => {
      let failure = false

      const bot = new IRCBotMock()
      const sasl = new DefaultSaslAuthenticator(
        bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      bot.mockMessage(':silver.libera.chat CAP * ACK :sasl')
      bot.mockMessage('AUTHENTICATE')
      expect(failure).to.be.true
    })

    it('handleAuth invalid param name', () => {
      let failure = false

      const bot = new IRCBotMock()
      const sasl = new DefaultSaslAuthenticator(
        bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      bot.mockMessage(':silver.libera.chat CAP * ACK :sasl')
      bot.mockMessage('AUTHENTICATE -')
      expect(failure).to.be.true
    })
  })
})
