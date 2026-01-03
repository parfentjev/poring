import { TZDate } from '@date-fns/tz'
import type { Clock } from '../types/utils'

export class TZDateClock implements Clock {
  private static instance: Clock

  private constructor() {}

  static getInstance = () => {
    if (!TZDateClock.instance) TZDateClock.instance = new TZDateClock()

    return TZDateClock.instance
  }

  now = (offset = '+00:00'): TZDate => {
    return TZDate.tz(offset)
  }
}
