import { IBotConfig, ICronHandlerConfig, ITimerHandlerConfig } from './config'
import { IStorage, IStorageTimer } from './storage'

export interface IIRCBot {
  /**
   * Establishes a connection to the IRC server.
   */
  connect: () => void

  /**
   * Sends a message to the IRC server.
   */
  send: SendFunction

  /**
   * Registers an event listener for a specific event.
   *
   * @param {string} event - The name of the event to listen for, e.g. PRIVMSG.
   * @param {IEventHandler} handler - The handler function to execute when the event occurs.
   */
  addEventListener: (event: string, handler: IEventHandler) => void

  /**
   * Clears existing event handlers.
   */
  clearEventListeners: () => void
}

/**
 * Sends a raw message to the IRC server.
 *
 * @param {string} message - The message text to send. New line characters will be added automatically.
 */
type SendFunction = (string: string) => void

export interface IMessage {
  prefix: string
  command: string
  params: string[]
  text: IText

  /**
   * Determines if the message was sent to a channel.
   *
   * @returns {boolean} True if the message was sent to a channel, false otherwise.
   */
  isChannel(): boolean
}

export interface IText {
  value: string

  /**
   * Retrieves the user's text command.
   *
   * @returns {string} The first word(s) in the message, representing the command.
   */
  command(): string
}

export interface IEventContext {
  send: SendFunction
  message: IMessage
  config: IBotConfig
  storage: IStorage
}

export interface IEventHandler {
  (context: IEventContext): void
}

export interface IScheduleContext {
  send: SendFunction
  config: IBotConfig
  storage: IStorage
}

export interface IScheduleHandler {
  (context: IScheduleContext): void
}

export type SaslState = 'idle' | 'requested' | 'authPlain' | 'authPassword'

export interface ISaslAuthenticator {
  /**
   * Manages and executes the SASL authentication flow.
   */
  handle: () => void
}

export interface IScheduler {
  /**
   * Creates a new cron job.
   *
   * @param {IScheduleHandler} handler - Function to execute for the cron job.
   * @param {ICronHandlerConfig} config - Configuration settings for the cron job.
   */
  addCronJob: (handler: IScheduleHandler, config: ICronHandlerConfig) => void

  /**
   * Cancels existing jobs.
   */
  clearCronJobs: () => void

  /**
   * Creates a new timer job.
   *
   * @param {IScheduleHandler} handler - Function to execute for the timer job.
   * @param {ITimerHandlerConfig} config - Configuration settings for the timer job.
   */
  addTimerJob: (handler: IScheduleHandler, config: ITimerHandlerConfig) => void

  /**
   * Cancels existing jobs.
   */
  clearTimerJobs: () => void
}

export interface IExecutionTimeCalculator {
  /**
   * Generates a random time within a specified range.
   *
   * @param {number} start - Time range start (in minutes).
   * @param {number} end - Time range end (in minutes).
   * @returns {Date} Current date plus a random value within the specified range.
   */
  randomTime: (start: number, end: number) => Date

  /**
   * Determines the appropriate date based on an existing timer.
   *
   * @param {Date} existingDate - Existing execution date.
   * @param {number} delay - Delay to use (in minutes) if the timer is outdated.
   * @returns {Date} Timer's date or current date plus the specified delay.
   */
  fromDate: (existingDate: Date, delay: number) => Date
}

export interface IScriptManager {}

export interface IScript {
  config: IScriptConfig
  eventHandler?: IEventHandler
  scheduleHandler?: IScheduleHandler
}

export interface IScriptConfig {
  type: ScriptType
  event?: string
  cron?: ICronHandlerConfig
  timer?: ITimerHandlerConfig
}

export type ScriptType = 'eventHandler' | 'cronJob' | 'timerJob'
