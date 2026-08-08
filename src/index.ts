import { pino, type Logger } from 'pino'
import { type State, type Events } from './client/events.js'
import { Client } from './client/index.js'
import { loadConfig } from './config.js'
import { EventManager } from './event.js'
import { registerListeners } from './listeners/index.js'
import { loadMetadata } from './metadata.js'
import { createAbortSignal } from './shutdown.js'

async function run(logger: Logger) {
  const signal = createAbortSignal(logger)
  const metadata = loadMetadata(logger, './metadata.json')
  const config = loadConfig(process.env)
  const eventManager = new EventManager<State, Events>(logger)
  registerListeners(eventManager)

  const clinet = new Client({ logger, metadata, config, eventManager, signal })
  await clinet.run()
  process.exit(0)
}

const logLevel = process.env['LOG_LEVEL'] ?? 'info'
const logger = pino({ level: logLevel })

try {
  await run(logger)
} catch (err) {
  logger.error({ err }, 'unhandled error stopped the program')
  process.exit(1)
}
