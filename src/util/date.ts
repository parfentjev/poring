import { DateProvider } from '../types/date'

export class DefaultDateProvider implements DateProvider {
  now = () => {
    return new Date()
  }
}

export const plusMinutes = (date: Date, n: number) => {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + n)

  return result
}
