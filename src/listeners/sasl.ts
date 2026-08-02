import type { Authenticate, Cap, Connected, SaslSuccess, State } from '../client/events.js'
import type { ClientEvenetManager } from '../client/index.js'
import type { EventContext } from '../event.js'

// This whole flow was essentially reverse-engineered from my interactions with Libera.
// I suspect it might not work elsewhere.
export function registerSaslListeners(eventManager: ClientEvenetManager) {
  eventManager.on('connected', onConnected)
  eventManager.on('cap', onCap)
  eventManager.on('authenticate', onAuthenticate)
  eventManager.on('saslSuccess', onSaslSuccess)
}

async function onConnected(ctx: EventContext<State, Connected>) {
  const config = ctx.state.config
  if (config.sasl.enabled) {
    requestSasl(ctx.state)
  } else {
    sendIdent(ctx.state)
  }
}

async function onCap(ctx: EventContext<State, Cap>) {
  if (ctx.event.subcommand === 'ACK') {
    ctx.state.send('AUTHENTICATE PLAIN')
  }
}

async function onAuthenticate(ctx: EventContext<State, Authenticate>) {
  if (ctx.event.data === '+') {
    const { username, password } = ctx.state.config.sasl

    const credentials = Buffer.concat([
      Buffer.from('\x00'),
      Buffer.from(username ?? ''),
      Buffer.from('\x00'),
      Buffer.from(password ?? ''),
    ]).toString('base64')

    ctx.state.send(`AUTHENTICATE ${credentials}`)
  }
}

async function onSaslSuccess(ctx: EventContext<State, SaslSuccess>) {
  ctx.state.send('CAP END')
  sendIdent(ctx.state)
}

function requestSasl(state: State) {
  const config = state.config.sasl
  if (config.username === undefined || config.password === undefined) {
    throw new Error('sasl authentication is enabled, but credentials are undefined')
  }

  state.send('CAP REQ :sasl')
}

function sendIdent(state: State) {
  const { nickname, username, realname } = state.config.core
  state.send(`NICK ${nickname}`)
  state.send(`USER ${username} 0 * :${realname}`)
}
