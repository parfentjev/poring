import { PoringConfig } from './config'
import { PoringIRCBot } from './irc'
import { MariaDBStorage } from './storage'

const main = async () => {
  const config = new PoringConfig()

  const storage = new MariaDBStorage(config.storage)
  await storage.connect()

  const bot = PoringIRCBot.create(config, storage)
  bot.connect()
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
