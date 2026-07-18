package handler

import "codeberg.org/parfentjev/poring/internal/event"

func RegisterHandlers(eventManager *event.EventManager) {
	registerCoreHandlers(eventManager)
	registerAuthenticatorHandlers(eventManager)
	registerRaweceekHandler(eventManager)
}
