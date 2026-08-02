export type RawMessage = {
  source: string
  prefix: string | undefined
  command: string
  params: string[]
  text: string | undefined
}

export function parseRawMessage(source: string): RawMessage {
  let message: Partial<RawMessage> = {}

  const tokens = source.trim().split(' ')
  const prefix = tokens[0]
  if (prefix && prefix.startsWith(':')) {
    message.prefix = prefix
    tokens.shift()
  }

  const command = tokens[0]
  if (command) {
    message.command = command
    tokens.shift()
  }

  message.params = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token) {
      if (token.startsWith(':')) {
        message.text = tokens.slice(i).join(' ').substring(1)
        break
      }

      message.params.push(token)
    }
  }

  return buildRawMessage(source, message)
}

function buildRawMessage(source: string, message: Partial<RawMessage>): RawMessage {
  const { prefix, command, params, text } = message

  if (command === undefined) {
    throw new Error('failed to build message: command is undefined')
  }

  if (params === undefined) {
    throw new Error('failed to build message: params array is undefined')
  }

  return { source, prefix, command, params, text }
}
