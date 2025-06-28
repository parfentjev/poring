import { Config, CronHandlerConfig, TimerHandlerConfig } from './config'
import { Storage, StorageTimer } from './storage'

export interface IRCBot {
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
   * @param {EventHandler} handler - The handler function to execute when the event occurs.
   */
  addEventListener: (event: string, handler: EventHandler) => void

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

export interface Message {
  prefix: string
  command: string
  params: string[]
  text: Text

  /**
   * Determines if the message was sent to a channel.
   *
   * @returns {boolean} True if the message was sent to a channel, false otherwise.
   */
  isChannel(): boolean
}

export interface Text {
  value: string

  /**
   * Retrieves the user's text command.
   *
   * @returns {string} The first word(s) in the message, representing the command.
   */
  command(): string
}

export interface EventContext {
  send: SendFunction
  message: Message
  config: Config
  storage: Storage
}

export interface EventHandler {
  (context: EventContext): void
}

export interface ScheduleContext {
  send: SendFunction
  config: Config
  storage: Storage
}

export interface ScheduleHandler {
  (context: ScheduleContext): void
}

export type SaslState = 'idle' | 'requested' | 'authPlain' | 'authPassword'

export interface SaslAuthenticator {
  /**
   * Manages and executes the SASL authentication flow.
   */
  handle: () => void
}

export interface Scheduler {
  /**
   * Creates a new cron job.
   *
   * @param {ScheduleHandler} handler - Function to execute for the cron job.
   * @param {CronHandlerConfig} config - Configuration settings for the cron job.
   */
  addCronJob: (handler: ScheduleHandler, config: CronHandlerConfig) => void

  /**
   * Cancels existing jobs.
   */
  clearCronJobs: () => void

  /**
   * Creates a new timer job.
   *
   * @param {ScheduleHandler} handler - Function to execute for the timer job.
   * @param {TimerHandlerConfig} config - Configuration settings for the timer job.
   */
  addTimerJob: (handler: ScheduleHandler, config: TimerHandlerConfig) => void

  /**
   * Cancels existing jobs.
   */
  clearTimerJobs: () => void
}

export interface ExecutionTimeCalculator {
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

export interface ScriptManager {}

export interface Script {
  config: ScriptConfig
  eventHandler?: EventHandler
  scheduleHandler?: ScheduleHandler
}

export interface ScriptConfig {
  type: ScriptType
  event?: string
  cron?: CronHandlerConfig
  timer?: TimerHandlerConfig
}

export type ScriptType = 'eventHandler' | 'cronJob' | 'timerJob'
