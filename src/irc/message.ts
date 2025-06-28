import { Message, Text } from '../types/irc'

export class DefaultMessage implements Message {
  constructor(public prefix: string, public command: string, public params: string[], public text: Text) {}

  isChannel = () => {
    if (this.params.length === 0) return false

    return this.params[0].startsWith('#')
  }
}

export class DefaultText implements Text {
  constructor(public value: string) {}

  command = () => {
    const i = this.value.indexOf(' ')
    if (i === -1) return this.value

    return this.value.slice(0, i)
  }
}

export const parseMessage = (input: string): Message => {
  const message = input.trim().split(' ')
  const params: string[] = []

  let prefix = ''
  let command = ''
  let text = ''

  if (message[0].startsWith(':')) {
    prefix = message[0]
    message.shift()
  }

  command = message[0]
  message.shift()

  for (let i = 0; i < message.length; i++) {
    const token = message[i]
    if (token.startsWith(':')) {
      text = message.slice(i).join(' ').substring(1)
      break
    }

    params.push(token)
  }

  return new DefaultMessage(prefix, command, params, new DefaultText(text))
}
