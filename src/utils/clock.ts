import { TZDate } from '@date-fns/tz'
import type { Clock } from '../types/utils'

export const tzDateClock: Clock = {
  now: (offset = '+00:00'): TZDate => {
    return TZDate.tz(offset)
  },
}
