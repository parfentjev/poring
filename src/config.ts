import dotenv from 'dotenv'
import { Config, SaslConfig, ScriptManagerConfig, ServerConfig, StorageConfig } from './types/config'

export class PoringConfig implements Config {
  server: ServerConfig
  scripts: ScriptManagerConfig
  storage: StorageConfig
  sasl: SaslConfig

  constructor() {
    dotenv.config()

    this.server = {
      host: process.env.SERVER_HOST!,
      port: +process.env.SERVER_PORT!,
      nickname: process.env.SERVER_NICKNAME!,
      channels: process.env.SERVER_CHANNELS!.split(','),
    }

    this.scripts = {
      scriptsDirectory: process.env.SCRIPTS_DIRECTORY!,
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
  }
}
