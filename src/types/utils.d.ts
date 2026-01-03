import type { TZDate } from '@date-fns/tz'

export interface Clock {
  now(offset: string): TZDate
}
