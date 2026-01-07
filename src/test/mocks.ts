import { TZDate } from '@date-fns/tz'
import type { Clock } from '../types/utils'

export class ClockMock implements Clock {
  constructor(private baseDate = TZDate.tz('UTC')) {}

  now = (offset: string): TZDate => {
    return this.baseDate.withTimeZone(offset)
  }
}
