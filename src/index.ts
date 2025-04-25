import config from './config'
import { registerHandlers } from './handlers'
import IRCBot from './irc'

const main = async () => {
  const bot = new IRCBot(config)
  bot.connect()
  registerHandlers(config, bot)
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
