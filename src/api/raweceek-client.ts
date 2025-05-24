import { IRaweCeekApiClient, SessionsCountdownResponse, SessionsNextResponse } from '../types/api'

class RaweCeekApiClient implements IRaweCeekApiClient {
  constructor(private baseUrl = 'https://raweceek.eu/api') {}

  private call = async <T>(endpoint: string): Promise<T | null> => {
    const url = this.baseUrl + endpoint

    return fetch(url)
      .then((response) => response.json() as T)
      .catch(() => null)
  }

  sessionsNext = async (series: string) => {
    return this.call<SessionsNextResponse>(`/sessions/next?series=${series}`)
  }

  sessionsCountdown = async (series: string) => {
    return this.call<SessionsCountdownResponse>(`/sessions/countdown?series=${series}`)
  }
}

export const raweceekClient = new RaweCeekApiClient()
