import type { Logger } from 'pino'

export function createAbortSignal(logger: Logger): AbortSignal {
  const abortController = new AbortController()

  const events: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
  for (const event of events) {
    process.once(event, () => {
      logger.info(`${event} received`)
      abortController.abort()
    })
  }

  return abortController.signal
}
