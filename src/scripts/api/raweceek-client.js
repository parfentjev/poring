class RaweCeekApiClient {
  constructor() {
    this.baseUrl = 'https://raweceek.eu/api'
  }

  call = async (endpoint) => {
    const url = this.baseUrl + endpoint

    return fetch(url)
      .then((response) => response.json())
      .catch(() => null)
  }

  sessionsNext = async (series) => {
    return this.call(`/sessions/next?series=${series}`)
  }

  sessionsCountdown = async (series) => {
    return this.call(`/sessions/countdown?series=${series}`)
  }
}

export const raweceekClient = new RaweCeekApiClient()
