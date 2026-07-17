package event

import (
	"log/slog"
	"reflect"
)

type EventContext[S, E any] struct {
	State S
	Event E
}

type EventHandlerMap map[reflect.Type][]func(any) error

type EventManager struct {
	Logger   *slog.Logger
	handlers EventHandlerMap
}

func NewManager(logger *slog.Logger) *EventManager {
	return &EventManager{
		Logger:   logger.With("component", "event-manager"),
		handlers: make(EventHandlerMap),
	}
}

func Subscribe[S, T any](manager *EventManager, handler func(EventContext[S, T]) error) {
	eventType := reflect.TypeFor[T]()
	manager.handlers[eventType] = append(manager.handlers[eventType], func(ctx any) error {
		return handler(ctx.(EventContext[S, T]))
	})
}

func Publish[S, T any](manager *EventManager, ctx EventContext[S, T]) {
	eventType := reflect.TypeFor[T]()
	handlers := manager.handlers[eventType]

	for _, handler := range handlers {
		var err error
		go func() { err = handler(ctx) }()

		if err != nil {
			manager.Logger.Warn("handler exited with an error", "error", err)
		}
	}
}
