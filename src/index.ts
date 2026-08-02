import { pino, type Logger } from 'pino'
import { type State, type Events } from './client/events.js'
import { Client } from './client/index.js'
import { loadConfig } from './config.js'
import { EventManager } from './event.js'
import { registerListeners } from './listeners/index.js'

async function run(logger: Logger) {
  const config = loadConfig(process.env)
  const eventManager = new EventManager<State, Events>(logger)
  registerListeners(eventManager)

  const clinet = new Client({ logger, config, eventManager })
  await clinet.run()
}

const logLevel = process.env['LOG_LEVEL'] ?? 'info'
const logger = pino({ level: logLevel })

try {
  await run(logger)
} catch (error) {
  logger.error({ err: error }, 'unhandled error stopped the program')
  process.exit(1)
}
