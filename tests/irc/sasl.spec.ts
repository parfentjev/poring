import { expect } from 'chai'
import { createBotWithTestDependencies } from '../mocks/irc'
import { DefaultSaslAuthenticator } from '../../src/irc/sasl'

describe('Sasl', () => {
  const mock = createBotWithTestDependencies()

  afterEach(() => mock.cleanUp())

  describe('SaslAuthenticator', () => {
    it('auth flow success', () => {
      let success = false

      const sasl = new DefaultSaslAuthenticator(
        mock.bot,
        () => (success = true),
        () => {}
      )

      sasl.handle()
      expect(mock.getMessages()).to.include('CAP REQ :sasl\r\n')

      mock.mockMessage(':silver.libera.chat CAP * ACK :sasl')
      expect(mock.getMessages()).to.include('AUTHENTICATE PLAIN\r\n')

      mock.mockMessage('AUTHENTICATE +')
      expect(mock.getMessages()).to.include('AUTHENTICATE AHBvcmluZwB0ZXN0\r\n')

      mock.mockMessage(':silver.libera.chat 903 poring-dev :SASL authentication successful')
      expect(mock.getMessages()).to.include('CAP END\r\n')
      expect(success).to.be.true
    })

    it('handleCap too many params', () => {
      let failure = false

      const sasl = new DefaultSaslAuthenticator(
        mock.bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      mock.mockMessage(':silver.libera.chat CAP * ACK EXTRA :sasl')
      expect(failure).to.be.true
    })

    it('handleCap invalid param name', () => {
      let failure = false

      const sasl = new DefaultSaslAuthenticator(
        mock.bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      mock.mockMessage(':silver.libera.chat CAP * INVALID :sasl')
      expect(failure).to.be.true
    })

    it('handleCap invalid auth method', () => {
      let failure = false

      const sasl = new DefaultSaslAuthenticator(
        mock.bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      mock.mockMessage(':silver.libera.chat CAP * ACK :notSasl')
      expect(failure).to.be.true
    })

    it('handleAuth no params', () => {
      let failure = false

      const sasl = new DefaultSaslAuthenticator(
        mock.bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      mock.mockMessage(':silver.libera.chat CAP * ACK :sasl')
      mock.mockMessage('AUTHENTICATE')
      expect(failure).to.be.true
    })

    it('handleAuth invalid param name', () => {
      let failure = false

      const sasl = new DefaultSaslAuthenticator(
        mock.bot,
        () => {},
        () => (failure = true)
      )

      sasl.handle()
      mock.mockMessage(':silver.libera.chat CAP * ACK :sasl')
      mock.mockMessage('AUTHENTICATE -')
      expect(failure).to.be.true
    })
  })
})
