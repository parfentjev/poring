import { expect } from 'chai'
import { Message, parseMessage, Text } from '../../../src/irc/message'

describe('Message', () => {
  describe('Message', () => {
    it('isChannel true', () => {
      const message = new Message('', '', ['#test'], new Text(''))
      expect(message.isChannel()).to.be.true
    })

    it('isChannel false', () => {
      const message = new Message('', '', ['test'], new Text(''))
      expect(message.isChannel()).to.be.false
    })

    it('isChannel not enough params', () => {
      const message = new Message('', '', [], new Text(''))
      expect(message.isChannel()).to.be.false
    })
  })

  describe('Text', () => {
    it('command single word', () => {
      const command = '!test'

      const text = new Text(command)
      expect(text.command()).to.be.equal(command)
    })

    it('command multiple words', () => {
      const command = '!test'

      const text = new Text(`${command} bla bla bla`)
      expect(text.command()).to.be.equal(command)
    })
  })

  describe('Misc.', () => {
    it('parseMessage ping', () => {
      const message = parseMessage('PING :lead.libera.chat')
      expect(message.prefix).to.be.empty
      expect(message.command).to.be.equal('PING')
      expect(message.params).to.be.empty
      expect(message.text.value).to.be.equal('lead.libera.chat')
    })

    it('parseMessage privmsg', () => {
      const message = parseMessage(':nemo_steel!~Nemo_Stee@user/nemo-iron:80752 PRIVMSG #f1 :Well')
      expect(message.prefix).to.be.equal(':nemo_steel!~Nemo_Stee@user/nemo-iron:80752')
      expect(message.command).to.be.equal('PRIVMSG')
      expect(message.params).to.deep.equal(['#f1'])
      expect(message.text.value).to.be.equal('Well')
    })
  })
})
