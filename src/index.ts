import { Config } from './config'
import { addListeners } from './listeners'
import { IRCBot } from './irc'
import { Storage } from './storage'

const main = async () => {
  const config = new Config()

  const storage = new Storage(config.storage)
  await storage.connect()

  const bot = new IRCBot(config, storage)
  bot.connect()
  addListeners(config, bot)
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
