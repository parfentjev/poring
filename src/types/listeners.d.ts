import { IEventHandler } from './irc'

export interface IEventListener {
  event: string
  handler: IEventHandler
}
