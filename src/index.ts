import { type State, type Events, type Ping } from './client/event.js'
import { loadConfig } from './config.js'
import { EventManager, type EventContext } from './event.js'

const config = loadConfig(process.env)

const eventManager = new EventManager<State, Events>()

eventManager.on('ping', async (context: EventContext<State, Ping>) => {
  const token = context.event.token
  console.log(`got ping: ${token}`)
})

await eventManager.emit('ping', { state: { config: config.listener }, event: { token: 'my cat is cute' } })
