import dotenv from 'dotenv'
import { IConfig } from './types/config'

dotenv.config()

export const config: IConfig = {
  server: {
    host: process.env.SERVER_HOST!,
    port: +process.env.SERVER_PORT!,
    nickname: process.env.SERVER_NICKNAME!,
    channels: process.env.SERVER_CHANNELS!.split(','),
  },
  sasl: {
    enabled: process.env.SASL_ENABLED! === '1' ? true : false,
    username: process.env.SASL_USERNAME!,
    password: process.env.SASL_PASSWORD!,
  },
  handler: {
    next: {
      cron: process.env.HANDLER_NEXT_CRON!,
      channel: process.env.HANDLER_NEXT_CHANNEL!,
    },
    poring: {
      timerRangeStart: +process.env.HANDLER_PORING_TIMER_RANGE_START!,
      timerRangeEnd: +process.env.HANDLER_PORING_TIMER_RANGE_END!,
      channel: process.env.HANDLER_PORING_CHANNEL!,
    },
  },
}
