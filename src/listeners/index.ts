import type { ClientEvenetManager } from '../client/index.js'
import { registerCoreListeners } from './core.js'
import { registerRaweceekListeners } from './raweceek.js'
import { registerSaslListeners } from './sasl.js'

export function registerListeners(eventManager: ClientEvenetManager) {
  registerCoreListeners(eventManager)
  registerSaslListeners(eventManager)
  registerRaweceekListeners(eventManager)
}
