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
  privateMessage: PrivateMessage
  // Server events
  cap: Cap
  authenticate: Authenticate
  saslSuccess: SaslSuccess
  welcome: Welcome
  ping: Ping
}

// Client events
export type Connected = {}

export type Disconnected = {}

// Server events
export type Cap = {
  target: string
  subcommand: string
  capablities: string
}

export function constructCap(raw: RawMessage): Cap {
  assertCommandEquals(raw, 'CAP')

  return { target: getParam(raw, 0), subcommand: getParam(raw, 1), capablities: getText(raw) }
}

export type Authenticate = {
  data: string
}

export function constructAuthenticate(raw: RawMessage): Authenticate {
  assertCommandEquals(raw, 'AUTHENTICATE')

  return { data: getParam(raw, 0) }
}

export type SaslSuccess = {
  target: string
  text: string
}

export function constructSaslSuccess(raw: RawMessage): SaslSuccess {
  assertCommandEquals(raw, '903')

  return { target: getParam(raw, 0), text: getText(raw) }
}

export type Welcome = {}

export function constructWelcome(_: RawMessage): Welcome {
  return {}
}

export type Ping = {
  readonly token: string
}

export function constructPing(raw: RawMessage): Ping {
  assertCommandEquals(raw, 'PING')

  return { token: getText(raw) }
}

export type PrivateMessage = {
  readonly sender: string
  readonly receiver: string
  readonly text: string
}

export function constructPrivateMessage(raw: RawMessage): PrivateMessage {
  assertCommandEquals(raw, 'PRIVMSG')

  return { sender: getPrefix(raw), receiver: getParam(raw, 0), text: getText(raw) }
}

function assertCommandEquals(raw: RawMessage, command: string) {
  if (raw.command === command) {
    return
  }

  throw new Error(`expected ${command} command in: ${raw.source}`)
}

function getPrefix(raw: RawMessage): string {
  if (raw.prefix === undefined) {
    throw new Error(`missing prefix in: ${raw.source}`)
  }

  return raw.prefix
}

function getParam(raw: RawMessage, i: number): string {
  if (raw.params.length + 1 < i) {
    throw new Error(`missing ${i}th param in: ${raw.source}`)
  }

  const param = raw.params[i]
  if (param === undefined) {
    throw new Error(`undefined ${i}th param in: ${raw.source}`)
  }

  return param
}

function getText(raw: RawMessage): string {
  if (raw.text === undefined) {
    throw new Error(`missing text in: ${raw.source}`)
  }

  return raw.text
}
