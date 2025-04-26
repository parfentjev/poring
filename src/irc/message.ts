import { IMessage, IText } from '../types/irc'

export class Message implements IMessage {
  prefix: string
  command: string
  params: string[]
  text: IText

  constructor(prefix: string, command: string, params: string[], text: IText) {
    this.prefix = prefix
    this.command = command
    this.params = params
    this.text = text
  }

  isChannel = () => {
    if (this.params.length === 0) return false

    return this.params[0].startsWith('#')
  }
}

export class Text implements IText {
  value: string

  constructor(value: string) {
    this.value = value
  }

  command = () => {
    const i = this.value.indexOf(' ')
    if (i === -1) return this.value

    return this.value.slice(0, i)
  }
}

export const parseMessage = (input: string): IMessage => {
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

  return new Message(prefix, command, params, new Text(text))
}
