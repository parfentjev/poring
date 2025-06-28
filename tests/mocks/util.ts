import { DateProvider } from '../../src/types/date'

export class DateProviderMock implements DateProvider {
  private date = new Date()

  now = () => new Date(this.date.getTime())
}
