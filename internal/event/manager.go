package event

import "reflect"

type EventContext[S, E any] struct {
	State S
	Event E
}

type EventHandlerMap map[reflect.Type][]func(any)

type EventManager struct {
	handlers EventHandlerMap
}

func NewManager() *EventManager {
	return &EventManager{handlers: make(EventHandlerMap)}
}

func Subscribe[S, T any](manager *EventManager, handler func(EventContext[S, T])) {
	eventType := reflect.TypeFor[T]()
	manager.handlers[eventType] = append(manager.handlers[eventType], func(ctx any) {
		handler(ctx.(EventContext[S, T]))
	})
}

func Publish[S, T any](manager *EventManager, ctx EventContext[S, T]) {
	eventType := reflect.TypeFor[T]()
	handlers := manager.handlers[eventType]

	for _, handler := range handlers {
		handler(ctx)
	}
}
