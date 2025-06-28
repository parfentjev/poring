export interface DateProvider {
  /**
   * Returns the current date and time.
   *
   * @method now
   * @returns {Date} The current date and time.
   */
  now: () => Date
}
