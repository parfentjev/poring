import type { ClientEvenetManager } from '../client/index.js'
import { registerCoreListeners } from './core.js'
import { registerRaweceekListeners } from './raweceek.js'

export function registerListeners(eventManager: ClientEvenetManager) {
  registerCoreListeners(eventManager)
  registerRaweceekListeners(eventManager)
}
