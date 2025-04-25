export interface RaweCeekResponse {
  session: RaweCeekSesson
  countdowns: RaweCeekCountdown[]
  isRaceWeek: boolean
}

export interface RaweCeekSesson {
  summary: string
  location: string
  startTime: Date
}

export interface RaweCeekCountdown {
  value: number
  unit: string
}
