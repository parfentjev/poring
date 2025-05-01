import { IConfig } from './config'
import { IStorage } from './storage'

export interface IMessage {
  prefix: string
  command: string
  params: string[]
  text: IText
  isChannel(): boolean
}

export interface IText {
  value: string
  command(): string
}

export interface IEventContext {
  send(message: string): void
  message: IMessage
  config: IConfig
  storage: IStorage
}

export interface IEventHandler {
  (context: IEventContext): void
}

export interface IScheduleContext {
  send(message: string): void
  config: IConfig
  storage: IStorage
}

export interface IScheduleHandler {
  (context: IScheduleContext): void
}
