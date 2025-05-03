import { SessionsCountdownResponse } from '../types/api'

class RaweCeekApiClient {
  constructor(private baseUrl = 'https://raweceek.eu/api') {}

  fetchCountdown = async (): Promise<SessionsCountdownResponse | null> => {
    return fetch(`${this.baseUrl}/sessions/countdown`)
      .then((response) => response.json())
      .catch(() => null)
  }
}

export const raweceekClient = new RaweCeekApiClient()
