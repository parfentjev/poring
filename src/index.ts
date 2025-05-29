import { Config } from './config'
import { IRCBot } from './irc'
import { Storage } from './storage'

const main = async () => {
  const config = new Config()

  const storage = new Storage(config.storage)
  await storage.connect()

  const bot = new IRCBot(config, storage)
  bot.connect()
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
