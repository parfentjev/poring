import type { PrivateMessage, State } from '../client/events.js'
import type { ClientEvenetManager } from '../client/index.js'
import type { ListenerRaweceekConfig } from '../config.js'
import type { EventContext } from '../event.js'

type Response = {
  upcoming_sessions: Session[]
  race_week: boolean
}

type Session = {
  summary: string
  countdowns: {
    type: string
    value: string
  }[]
}

export function registerRaweceekListeners(eventManager: ClientEvenetManager) {
  eventManager.on('privateMessage', onMessage)
}

async function onMessage(ctx: EventContext<State, PrivateMessage>) {
  if (ctx.event.text !== '!ceeks') {
    return
  }

  const config = ctx.state.config.raweceek
  if (config.listenOn.includes(ctx.event.receiver)) {
    await handle(config, ctx.state.send, ctx.event.receiver)
  }
}

async function handle(config: ListenerRaweceekConfig, send: (message: string) => void, channel: string) {
  const response = await fetch(`${config.serviceUrl}/api/v2/status`, { signal: AbortSignal.timeout(1_000) })
  if (response.ok === false) {
    throw new Error(`response status: ${response.status}`)
  }

  const nextSession = parseResponse(await response.json())
  const countdown = nextSession.countdowns.find((c) => c.type === 'CEEKS')?.value
  if (countdown === undefined) {
    throw new Error(`CEEKS countdown is missing: ${response}`)
  }

  send(`PRIVMSG ${channel} :\x02${nextSession.summary}\x02 begins in ${countdown} 🎉`)
}

function parseResponse(response: unknown): Session {
  const { upcoming_sessions: upcoming } = response as Partial<Response>
  if (upcoming === undefined) {
    throw new Error(`upcoming_sessions is undefined: ${response}`)
  }

  if (!Array.isArray(upcoming) || upcoming.length === 0) {
    throw new Error(`corrupted upcoming_sessions: ${response}`)
  }

  const nextSession = upcoming[0]!
  if (nextSession.summary === undefined) {
    throw new Error(`summary is undefined: ${response}`)
  }

  if (nextSession.countdowns === undefined) {
    throw new Error(`countdowns is undefined: ${response}`)
  }

  return nextSession
}
