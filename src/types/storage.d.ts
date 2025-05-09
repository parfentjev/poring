export interface IStorage {
  /**
   * Establishes a connection to the database.
   */
  connect: () => void

  /**
   * Retrieves a random message from the specified category.
   *
   * @param {string} category - The category from which to retrieve the message.
   * @returns {QueryData<IStorageMessage>} A query result containing a random message from the specified category.
   */
  getRandomMessage: (category: string) => QueryData<IStorageMessage>

  /**
   * Increases the usage count of a specific message.
   *
   * @param {string} messageId - The ID of the message to update.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  increaseMessageUsageCount: (messageId: string) => Promise<void>

  /**
   * Inserts or updates a timer in the database.
   *
   * @param {string} id - The ID of the timer.
   * @param {Date} executeAt - The date and time when the timer should execute.
   * @param {boolean} executed - Whether the timer has been executed.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  upsertTimer: (id: string, executeAt: Date, executed: boolean) => Promise<void>

  /**
   * Retrieves a timer by its ID.
   *
   * @param {string} id - The ID of the timer to retrieve.
   * @returns {QueryData<IStorageTimer>} A query result containing the timer data.
   */
  getTimer: (id: string) => QueryData<IStorageTimer>
}

export interface IStorageMessage {
  id: string
  text: string
}

export interface IStorageTimer {
  id: string
  executeAt: Date
  executed: boolean
}

export type QueryData<T> = Promise<T | null>
