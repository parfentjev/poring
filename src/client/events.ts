import type { Logger } from 'pino'
import type { ListenerConfig } from '../config.js'
import type { RawMessage } from './message.js'
import type { TypeEventMap } from '../event.js'
import type { Metadata } from '../metadata.js'

export type State = {
  logger: Logger
  metadata: Metadata
  config: ListenerConfig
  send: (message: string) => void
}

export type Events = TypeEventMap<
  Connected | Disconnected | PrivateMessage | Cap | Authenticate | SaslSuccess | Welcome | Ping
>

// Client events
export type Connected = {
  readonly type: 'connected'
}

export type Disconnected = {
  readonly type: 'disconnected'
}

// Server events
export type Cap = {
  readonly type: 'cap'
  readonly target: string
  readonly subcommand: string
  readonly capablities: string
}

export function constructCap(raw: RawMessage): Cap {
  assertCommandEquals(raw, 'CAP')

  return { type: 'cap', target: getParam(raw, 0), subcommand: getParam(raw, 1), capablities: getText(raw) }
}

export type Authenticate = {
  readonly type: 'authenticate'
  readonly data: string
}

export function constructAuthenticate(raw: RawMessage): Authenticate {
  assertCommandEquals(raw, 'AUTHENTICATE')

  return { type: 'authenticate', data: getParam(raw, 0) }
}

export type SaslSuccess = {
  readonly type: 'saslSuccess'
  readonly target: string
  readonly text: string
}

export function constructSaslSuccess(raw: RawMessage): SaslSuccess {
  assertCommandEquals(raw, '903')

  return { type: 'saslSuccess', target: getParam(raw, 0), text: getText(raw) }
}

export type Welcome = {
  readonly type: 'welcome'
}

export function constructWelcome(raw: RawMessage): Welcome {
  assertCommandEquals(raw, '001')

  return { type: 'welcome' }
}

export type Ping = {
  readonly type: 'ping'
  readonly token: string
}

export function constructPing(raw: RawMessage): Ping {
  assertCommandEquals(raw, 'PING')

  return { type: 'ping', token: getText(raw) }
}

export type PrivateMessage = {
  readonly type: 'privateMessage'
  readonly sender: {
    raw: string
    nickname: string
  }
  readonly receiver: string
  readonly text: string
}

export function constructPrivateMessage(raw: RawMessage): PrivateMessage {
  assertCommandEquals(raw, 'PRIVMSG')

  const senderPrefix = getPrefix(raw).substring(1)
  const senderNickname = senderPrefix.split('!')[0]
  if (senderNickname === undefined) {
    throw new Error(`malformed prefix: ${senderPrefix}`)
  }

  return {
    type: 'privateMessage',
    sender: {
      raw: senderPrefix,
      nickname: senderNickname,
    },
    receiver: getParam(raw, 0),
    text: getText(raw),
  }
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
