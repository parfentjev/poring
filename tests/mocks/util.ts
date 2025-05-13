import { IDateProvider } from '../../src/types/date'

export class DateProviderMock implements IDateProvider {
  private date = new Date()

  now = () => new Date(this.date.getTime())
}
