import type { ListenerConfig } from '../config.js'

export type State = {
  config: ListenerConfig
}

export type Events = {
  welcome: Welcome
  ping: Ping
}

export type Welcome = {}

export type Ping = {
  readonly token: string
}
