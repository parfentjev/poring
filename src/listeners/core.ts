import type { Connected, Disconnected, Ping, State, Welcome } from '../client/events.js'
import type { ClientEvenetManager } from '../client/index.js'
import type { EventContext } from '../event.js'

export function registerCoreListeners(eventManager: ClientEvenetManager) {
  eventManager.on('connected', onConnected)
  eventManager.on('welcome', onWelcome)
  eventManager.on('ping', onPing)
  eventManager.on('disconnected', onDisconnected)
}

async function onConnected(ctx: EventContext<State, Connected>) {
  ctx.state.logger.info('connected to the server')
}

async function onWelcome(ctx: EventContext<State, Welcome>) {
  ctx.state.send(`JOIN ${ctx.state.config.core.autojoin}`)
}

async function onPing(ctx: EventContext<State, Ping>) {
  ctx.state.send(`PONG :${ctx.event.token}`)
}

async function onDisconnected(ctx: EventContext<State, Disconnected>) {
  ctx.state.logger.info('disconnected from the server')
}
