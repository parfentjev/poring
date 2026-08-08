import type { Logger } from 'pino'

export function createAbortSignal(logger: Logger): AbortSignal {
  const abortController = new AbortController()

  const events = ['SIGINT', 'SIGTERM']
  for (const event of events) {
    logger.info(`${event} received`)
    abortController.abort()
  }

  return abortController.signal
}
