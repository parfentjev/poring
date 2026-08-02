import type { Logger } from 'pino'

export type EventContext<State, Event> = {
  state: State
  event: Event
}

type EventListener<State, Event> = (context: EventContext<State, Event>) => Promise<void>

type EventListenerList<State> = Set<EventListener<State, unknown>>

type EventListenersMap<State, Events> = Map<keyof Events, EventListenerList<State>>

// todo: this isn't exactly working as I expected
//
// - empty events are interchargable because they have no props
// - type matching happens on the handler side, so onWelcome handler can handle 'ping' events
// because Welcome type has no props, so Ping type technically satisfies it;
// I need to rethink this to achieve compile-time checks
// so that listeners can only handler their specific events and nothing else
export class EventManager<State, Events> {
  private readonly logger: Logger
  private readonly listeners: EventListenersMap<State, Events>

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'event-manager' })
    this.listeners = new Map()
  }

  on<Event extends keyof Events>(eventType: Event, listener: EventListener<State, Events[Event]>) {
    let eventTypeListeners = this.listeners.get(eventType) ?? new Set()
    eventTypeListeners.add(listener as EventListener<State, unknown>)

    this.listeners.set(eventType, eventTypeListeners)
  }

  async emit<Event extends keyof Events>(eventType: Event, context: EventContext<State, Events[Event]>) {
    const listeners = this.listeners.get(eventType)
    if (listeners === undefined) {
      return
    }

    for (const listener of listeners) {
      try {
        await listener(context)
      } catch (error: unknown) {
        this.logger.error({ err: error }, 'listener error')
      }
    }
  }
}
