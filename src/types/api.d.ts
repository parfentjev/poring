export interface SessionsCountdownResponse {
  session: RaweCeekSesson
  countdowns: RaweCeekCountdown[]
  isRaceWeek: boolean
}

export interface RaweCeekSesson {
  summary: string
  location: string
  startTime: string
}

export interface RaweCeekCountdown {
  value: number
  unit: string
}
