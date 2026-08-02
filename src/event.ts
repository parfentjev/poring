export type EventContext<State, Event> = {
  state: State
  event: Event
}

type EventListener<State, Event> = (context: EventContext<State, Event>) => Promise<void>

type EventListenerList<State> = Set<EventListener<State, unknown>>

export class EventManager<State, Events> {
  private readonly listeners: Map<keyof Events, EventListenerList<State>>

  constructor() {
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
        console.error('listener error', error)
      }
    }
  }
}
