import type { Logger } from 'pino'

type TypedEvent = { type: PropertyKey }

export type TypeEventMap<T extends TypedEvent> = {
  [Event in T as Event['type']]: Event
}

export type EventContext<State, Event extends TypedEvent> = {
  state: State
  event: Event
}

type EventListener<State, Event extends TypedEvent> = (ctx: EventContext<State, Event>) => Promise<void>

type EventListenerList<State> = Set<EventListener<State, TypedEvent>>

type EventListenersMap<State, Events> = Map<keyof Events, EventListenerList<State>>

export class EventManager<State, Events extends TypeEventMap<TypedEvent>> {
  private readonly logger: Logger
  private readonly listeners: EventListenersMap<State, Events>

  constructor(logger: Logger) {
    this.logger = logger.child({ component: 'event-manager' })
    this.listeners = new Map()
  }

  on<Event extends keyof Events>(eventType: Event, listener: EventListener<State, Events[Event]>) {
    let eventTypeListeners = this.listeners.get(eventType) ?? new Set()
    eventTypeListeners.add(listener as EventListener<State, TypedEvent>)

    this.listeners.set(eventType, eventTypeListeners)
  }

  async emit<Event extends keyof Events>(ctx: EventContext<State, Events[Event]>) {
    const listeners = this.listeners.get(ctx.event.type)
    if (listeners === undefined) {
      return
    }

    for (const listener of listeners) {
      try {
        await listener(ctx)
      } catch (error: unknown) {
        this.logger.error({ err: error }, 'listener error')
      }
    }
  }
}
