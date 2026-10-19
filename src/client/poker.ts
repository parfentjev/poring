import type { EventContext } from '../event.js'
import type { Disconnected, Pong, SendFn, State, Welcome } from './events.js'
import type { ClientEvenetManager } from './index.js'

// 5 minutes in milliseconds
const PING_INTERVAL_MS = 5 * 60 * 1000

// 1 minute in milliseconds
const PING_TIMEOUT_MS = 1 * 60 * 1000

type Callback = () => void

/**
 * Detects an unresponsive IRC connection with periodic PING/PONG checks.
 *
 * The TCP socket can remain open locally after the server disconnects the bot.
 * Sends PING messages after registration and calls the timeout handler if a
 * matching PONG does not arrive before the deadline.
 */
export class Poker {
  private callback: Callback | undefined
  private pingTimer?: NodeJS.Timeout
  private pongTimer?: NodeJS.Timeout
  private token: string | undefined

  /**
   * Registers listeners to start checks after registration and stop them on disconnect.
   *
   * @param em - Event manager for the IRC client.
   */
  constructor(em: ClientEvenetManager) {
    em.on('welcome', this.onWelcome.bind(this))
    em.on('pong', this.onPong.bind(this))
    em.on('disconnected', this.onDisconnect.bind(this))
  }

  /**
   * Sets the handler called when a PING receives no matching PONG before the timeout.
   * Replaces any previously registered handler.
   *
   * @param callback - Handler for an unresponsive connection.
   */
  onTimeout(callback: Callback) {
    this.callback = callback
  }

  private poke(send: SendFn) {
    this.token = Date.now().toString()
    send(`PING :${this.token}`)

    this.pongTimer = setTimeout(() => {
      this.callback && this.callback()
    }, PING_TIMEOUT_MS)
  }

  private async onWelcome(ctx: EventContext<State, Welcome>) {
    this.poke(ctx.state.send)
  }

  private async onPong(ctx: EventContext<State, Pong>) {
    if (ctx.event.token === this.token) {
      this.token = undefined
      this.pongTimer?.close()
      this.pingTimer = setTimeout(() => this.poke(ctx.state.send), PING_INTERVAL_MS)
    }
  }

  private async onDisconnect(_: EventContext<State, Disconnected>) {
    this.token = undefined
    this.pingTimer?.close()
    this.pongTimer?.close()
  }
}
