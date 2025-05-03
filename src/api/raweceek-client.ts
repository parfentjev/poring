import { SessionsCountdownResponse, SessionsNextResponse } from '../types/api'

class RaweCeekApiClient {
  constructor(private baseUrl = 'https://raweceek.eu/api') {}

  private call = async <T>(endpoint: string): Promise<T | null> => {
    const url = this.baseUrl + endpoint

    return fetch(url)
      .then((response) => response.json() as T)
      .catch(() => null)
  }

  sessionsNext = async () => {
    return this.call<SessionsNextResponse>('/sessions/next')
  }

  sessionsCountdown = async () => {
    return this.call<SessionsCountdownResponse>('/sessions/countdown')
  }
}

export const raweceekClient = new RaweCeekApiClient()
