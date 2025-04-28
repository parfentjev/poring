import { Config } from './config'
import { addListeners } from './listeners'
import { IRCBot } from './irc'

const main = async () => {
  const config = new Config()
  const bot = new IRCBot(config)
  bot.connect()
  addListeners(config, bot)
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
