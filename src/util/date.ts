import { IDateProvider } from '../types/date'

export class DateProvider implements IDateProvider {
  now = () => {
    return new Date()
  }
}

export const plusMinutes = (date: Date, n: number) => {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + n)

  return result
}
