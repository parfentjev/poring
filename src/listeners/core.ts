import type { Connected, Disconnected, Ping, State, Welcome } from '../client/events.js'
import type { ClientEvenetManager } from '../client/index.js'
import type { EventContext } from '../event.js'

export function registerCoreListeners(eventManager: ClientEvenetManager) {
  eventManager.on('connected', onConnect)
  eventManager.on('welcome', onWelcome)
  eventManager.on('ping', onPing)
  eventManager.on('disconnected', onDisconnect)
}

async function onConnect(ctx: EventContext<State, Connected>) {
  ctx.state.logger.info('connected to the server')

  const config = ctx.state.config.core
  ctx.state.send(`NICK ${config.nickname}`)
  ctx.state.send(`USER ${config.username} 0 * :${config.realname}`)
}

async function onWelcome(ctx: EventContext<State, Welcome>) {
  ctx.state.send(`JOIN ${ctx.state.config.core.autojoin}`)
}

async function onPing(ctx: EventContext<State, Ping>) {
  ctx.state.send(`PONG :${ctx.event.token}`)
}

async function onDisconnect(ctx: EventContext<State, Disconnected>) {
  ctx.state.logger.info('disconnected from the server')
}
