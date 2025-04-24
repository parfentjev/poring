import { IRCMessage } from '../types/irc'

export const parseMessage = (input: string): IRCMessage => {
  const message = input.trim().split(' ')
  const params: string[] = []

  let prefix = ''
  let command = ''
  let text = ''

  if (message[0].startsWith(':')) {
    prefix = extractFirstElement(message)
  }

  command = extractFirstElement(message)

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

function extractFirstElement(message: string[]): string {
  const firstElement = message[0]
  message.shift()

  return firstElement
}
