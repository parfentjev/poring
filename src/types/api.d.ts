export interface IRaweCeekApiClient {
  /**
   * Fetches the next sessions from raweceek.eu.
   *
   * @returns {Promise<SessionsNextResponse | null>} A promise that resolves to the next sessions data or null.
   */
  sessionsNext: () => Promise<SessionsNextResponse | null>

  /**
   * Fetches the countdown information for sessions from raweceek.su.
   *
   * @returns {Promise<SessionsCountdownResponse | null>} A promise that resolves to the sessions countdown data or null.
   */
  sessionsCountdown: () => Promise<SessionsCountdownResponse | null>
}

export type SessionsNextResponse = RaweCeekSesson

export interface SessionsCountdownResponse {
  session: RaweCeekSesson
  countdowns: RaweCeekCountdown[]
  isRaceWeek: boolean
}

export interface RaweCeekSesson {
  summary: string
  location: string
  startTime: string
  timeUntil: string
}

export interface RaweCeekCountdown {
  value: number
  unit: string
}
