import type { ClientEvenetManager } from '../client/index.js'
import { registerCoreListeners } from './core.js'

export function registerListeners(eventManager: ClientEvenetManager) {
  registerCoreListeners(eventManager)
}
