import type { PrivateMessage, State } from '../client/events.js'
import type { ClientEvenetManager } from '../client/index.js'
import type { ListenerRaweceekConfig } from '../config.js'
import type { EventContext } from '../event.js'

type Response = {
  nextSession: {
    summary: string
    countdowns: {
      type: string
      value: string
    }[]
  }
}

export function registerRaweceekListeners(eventManager: ClientEvenetManager) {
  eventManager.on('privateMessage', onMessage)
}

async function onMessage(ctx: EventContext<State, PrivateMessage>) {
  if (ctx.event.text !== '!ceeks') {
    return
  }

  if (ctx.event.receiver.startsWith('#')) {
    await handle(ctx.state.config.raweceek, ctx.state.send, ctx.event.receiver)
  }
}

async function handle(config: ListenerRaweceekConfig, send: (message: string) => void, channel: string) {
  const response = await fetch(`${config.serviceUrl}/api/status`, { signal: AbortSignal.timeout(1_000) })
  if (response.ok === false) {
    throw new Error(`response status: ${response.status}`)
  }

  const body = parseResponse(await response.json())
  const countdown = body.nextSession.countdowns.find((c) => c.type === 'CEEKS')
  if (countdown === undefined) {
    throw new Error(`CEEKS countdown is missing: ${response}`)
  }

  send(`PRIVMSG ${channel} :\x02${body.nextSession.summary}\x02 begins in ${countdown.value} 🎉`)
}

function parseResponse(response: unknown): Response {
  const { nextSession } = response as Partial<Response>
  if (nextSession === undefined) {
    throw new Error(`nestSession is undefined: ${response}`)
  }

  if (nextSession.summary === undefined) {
    throw new Error(`summary is undefined: ${response}`)
  }

  if (nextSession.countdowns === undefined) {
    throw new Error(`countdowns is undefined: ${response}`)
  }

  return { nextSession }
}
