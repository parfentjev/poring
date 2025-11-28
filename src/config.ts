import type { Config } from './types/config'

export const config: Config = {
  server: {
    host: process.env.SERVER_HOST!,
    port: parseInt(process.env.SERVER_PORT!),
  },
  user: {
    nickname: process.env.NICKNAME!,
    channels: process.env.CHANNELS ? process.env.CHANNELS.split(',') : [],
    sasl: {
      enabled: process.env.SASL_ENABLED === 'true',
      username: process.env.SASL_USERNAME,
      password: process.env.SASL_PASSWORD,
    },
  },
}
