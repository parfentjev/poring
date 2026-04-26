import type { Config, FreshRssConfig, IdleRpgConfig, RaweCeekConfig } from './types/config'

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
  listener: {
    raweCeek: {
      enabled: process.env.RAWE_CEEK_ENABLED === 'true',
      url: process.env.RAWE_CEEK_URL,
      isEnabled(): this is Required<RaweCeekConfig> {
        return this.enabled === true && this.url !== undefined
      },
    },
    freshRss: {
      enabled: process.env.FRESH_RSS_ENABLED === 'true',
      url: process.env.FRESH_RSS_URL,
      apiKey: process.env.FRESH_RSS_API_KEY,
      notification: process.env.FRESH_RSS_NOTIFICATION,
      target: process.env.FRESH_RSS_TARGET,
      isEnabled(): this is Required<FreshRssConfig> {
        return (
          this.enabled === true &&
          this.url !== undefined &&
          this.apiKey !== undefined &&
          this.notification !== undefined &&
          this.target !== undefined
        )
      },
    },
    idleRpg: {
      enabled: process.env.IDLE_RPG_ENABLED === 'true',
      cron: process.env.IDLE_RPG_CRON,
      channel: process.env.IDLE_RPG_CHANNEL,
      player: process.env.IDLE_RPG_PLAYER,
      notification: process.env.IDLE_RPG_NOTIFICATION,
      target: process.env.IDLE_RPG_TARGET,
      isEnabled(): this is Required<IdleRpgConfig> {
        return (
          this.enabled === true &&
          this.cron !== undefined &&
          this.channel !== undefined &&
          this.player !== undefined &&
          this.target !== undefined &&
          this.notification !== undefined
        )
      },
    },
  },
}
