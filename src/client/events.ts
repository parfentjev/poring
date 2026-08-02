import type { Logger } from 'pino'
import type { ListenerConfig } from '../config.js'
import type { RawMessage } from './message.js'

export type State = {
  logger: Logger
  config: ListenerConfig
  send: (message: string) => void
}

export type Events = {
  // Client events
  connected: Connected
  disconnected: Disconnected
  // Server events
  welcome: Welcome
  ping: Ping
}

// Client events
export type Connected = {}

export type Disconnected = {}

// Server events
export type Welcome = {}

export type Ping = {
  readonly token: string
}

export function constructWelcome(_: RawMessage): Welcome {
  return {}
}

export function constructPing(raw: RawMessage): Ping {
  requireCommand(raw, 'PING')

  return { token: getText(raw) }
}

function requireCommand(raw: RawMessage, command: string) {
  if (raw.command === command) {
    return
  }

  throw new Error(`expected ${command} command in: ${raw.source}`)
}

function getText(raw: RawMessage): string {
  if (raw.text === undefined) {
    throw new Error(`missing text in: ${raw.source}`)
  }

  return raw.text
}
