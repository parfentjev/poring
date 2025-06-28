import { TLSSocket } from 'tls'
import { Config } from '../../src/types/config'
import { IRCBot } from '../../src/types/irc'
import { Storage, StorageMessage, StorageTimer, QueryData } from '../../src/types/storage'
import { PoringIRCBot } from '../../src/irc'
import { EventEmitter } from 'stream'
import Sinon from 'sinon'

export const dummyConfig: Config = {
  server: {
    host: '',
    port: 0,
    nickname: '',
    channels: [],
  },
  scripts: {
    scriptsDirectory: '',
  },
  storage: {
    host: '',
    database: '',
    user: '',
    password: '',
  },
  sasl: {
    enabled: true,
    username: 'poring',
    password: 'test',
  },
}

export const dummyStorage: Storage = {
  connect: function (): void {
    throw new Error('Function not implemented.')
  },
  getRandomMessage: function (category: string): QueryData<StorageMessage> {
    throw new Error('Function not implemented.')
  },
  increaseMessageUsageCount: function (messageId: string): Promise<void> {
    throw new Error('Function not implemented.')
  },
  upsertTimer: function (id: string, executeAt: Date, executed: boolean): Promise<void> {
    throw new Error('Function not implemented.')
  },
  getTimer: function (id: string): QueryData<StorageTimer> {
    throw new Error('Function not implemented.')
  },
}

class TLSSocketMock extends EventEmitter {
  public messages: string[] = []

  write(data: string) {
    this.messages.push(data)
  }

  destroy = Sinon.stub()
}

export interface BotWithTestDependencies {
  bot: IRCBot
  socket: TLSSocket
  mockMessage: (message: string) => void
  getMessages: () => string[]
  cleanUp: () => void
}

export const createBotWithTestDependencies = (): BotWithTestDependencies => {
  const socket = new TLSSocketMock() as unknown as TLSSocket

  const bot = PoringIRCBot.createWithDependencies({
    config: dummyConfig,
    storage: dummyStorage,
    socket: socket,
    handlers: new Map(),
  })

  const clearMessages = () => ((socket as any).messages = [])

  return {
    bot,
    socket,
    mockMessage: (message: string) => socket.emit('data', Buffer.from(`${message}\r\n`)),
    getMessages: () => (socket as any).messages,
    cleanUp: () => {
      bot.clearEventListeners()
      clearMessages()
    },
  }
}
