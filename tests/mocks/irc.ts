import { TLSSocket } from 'tls'
import { IConfig, ICronHandlerConfig, ITimerHandlerConfig } from '../../src/types/config'
import { IEventHandler, IIRCBot, IScheduleHandler, IScheduler } from '../../src/types/irc'
import { IStorage, IStorageMessage, IStorageTimer, QueryData } from '../../src/types/storage'
import { parseMessage } from '../../src/irc/message'

const dummyConfig: IConfig = {
  server: {
    host: '',
    port: 0,
    nickname: '',
    channels: [],
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
  handler: {
    next: {
      cron: '',
      channel: '',
    },
    poring: {
      id: '',
      timerRangeStart: 0,
      timerRangeEnd: 0,
      channel: '',
    },
  },
}

const dummyStorage: IStorage = {
  connect: function (): void {
    throw new Error('Function not implemented.')
  },
  getRandomMessage: function (category: string): QueryData<IStorageMessage> {
    throw new Error('Function not implemented.')
  },
  increaseMessageUsageCount: function (messageId: string): Promise<void> {
    throw new Error('Function not implemented.')
  },
  upsertTimer: function (id: string, executeAt: Date, executed: boolean): Promise<void> {
    throw new Error('Function not implemented.')
  },
  getTimer: function (id: string): QueryData<IStorageTimer> {
    throw new Error('Function not implemented.')
  },
}

// I can probably use Sinon.js or something like that to mock TLSSocket
// and use the real IRCBot class instead
// which would also allow me to test IRCBot itself
export class IRCBotMock implements IIRCBot {
  public readonly messages: string[] = []

  constructor(
    private config: IConfig = dummyConfig,
    private storage: IStorage = dummyStorage,
    private socket: TLSSocket | null = null,
    private handlers = new Map<string, IEventHandler[]>(),
    private scheduler: IScheduler | null = null
  ) {}

  connect = () => {
    throw new Error('Function not implemented.')
  }

  send = (message: string) => {
    this.messages.push(message)
  }

  addEventListener = (event: string, handler: IEventHandler) => {
    const commandHandlers = this.handlers.get(event) ?? []
    commandHandlers.push(handler)
    this.handlers.set(event, commandHandlers)
  }

  addCronJob = (handler: IScheduleHandler, config: ICronHandlerConfig) => {
    throw new Error('Function not implemented.')
  }

  addTimerJob = (handler: IScheduleHandler, config: ITimerHandlerConfig) => {
    throw new Error('Function not implemented.')
  }

  mockMessage = (raw: string) => {
    const message = parseMessage(raw)
    this.handlers.get(message.command)?.forEach((handler) => {
      handler({
        send: this.send,
        message,
        config: this.config,
        storage: this.storage,
      })
    })
  }
}
