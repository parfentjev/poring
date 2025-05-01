import dotenv from 'dotenv'
import { IConfig, IHandlerConfig, ISaslConfig, IServerConfig, IStorageConfig } from './types/config'

export class Config implements IConfig {
  server: IServerConfig
  storage: IStorageConfig
  sasl: ISaslConfig
  handler: IHandlerConfig

  constructor() {
    dotenv.config()

    this.server = {
      host: process.env.SERVER_HOST!,
      port: +process.env.SERVER_PORT!,
      nickname: process.env.SERVER_NICKNAME!,
      channels: process.env.SERVER_CHANNELS!.split(','),
    }

    this.storage = {
      host: process.env.STORAGE_HOST!,
      database: process.env.STORAGE_DATABASE!,
      user: process.env.STORAGE_USER!,
      password: process.env.STORAGE_PASSWORD!,
    }

    this.sasl = {
      enabled: process.env.SASL_ENABLED! === '1' ? true : false,
      username: process.env.SASL_USERNAME!,
      password: process.env.SASL_PASSWORD!,
    }

    this.handler = {
      next: {
        cron: process.env.HANDLER_NEXT_CRON!,
        channel: process.env.HANDLER_NEXT_CHANNEL!,
      },
      poring: {
        timerRangeStart: +process.env.HANDLER_PORING_TIMER_RANGE_START!,
        timerRangeEnd: +process.env.HANDLER_PORING_TIMER_RANGE_END!,
        channel: process.env.HANDLER_PORING_CHANNEL!,
      },
    }
  }
}
