import type { IrcEventContext } from '../types/irc'
import { ClockMock } from './mocks'

export const createIrcEventContext = (onSend: (s: string) => void) =>
  <IrcEventContext>{
    send: (string: string) => onSend(string),
    message: {
      prefix: '',
      command: '',
      params: [],
      text: '',
    },
    config: {
      server: {
        host: '',
        port: 0,
      },
      user: {
        nickname: '',
        channels: [],
        sasl: {
          enabled: false,
          username: undefined,
          password: undefined,
        },
      },
      listener: {
        freshRss: {
          url: '',
          apiKey: '',
          notification: '',
          target: '',
        },
      },
    },
    clock: new ClockMock(),
  }
