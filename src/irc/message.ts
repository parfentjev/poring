import { IRCMessage } from '../types/irc'

export const parseMessage = (input: string): IRCMessage => {
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

  return { prefix, command, params, text }
}
