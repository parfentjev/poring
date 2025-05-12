import { expect } from 'chai'
import { ExecutionTimeCalculator } from '../../../src/irc/scheduler'
import { DateProviderMock } from '../../util/date'
import { plusMinutes } from '../../../src/util/date'

describe('Scheduler', () => {
  describe('ExecutionTimeCalculator', () => {
    const dateProvider = new DateProviderMock()
    const now = dateProvider.now()
    const calculator = new ExecutionTimeCalculator(dateProvider)

    it('randomTime within the specified range', () => {
      const [start, end] = [10, 11]

      const result = calculator.randomTime(start, end)
      expect(result.getTime()).to.be.at.least(plusMinutes(now, start).getTime())
      expect(result.getTime()).to.be.at.most(plusMinutes(now, end).getTime())
    })

    it('randomTime within a large range', () => {
      const [start, end] = [1440, 4320]

      const result = calculator.randomTime(start, end)
      expect(result.getTime()).to.be.at.least(plusMinutes(now, start).getTime())
      expect(result.getTime()).to.be.at.most(plusMinutes(now, end).getTime())
    })

    it('randomTime with start = 0', () => {
      const [start, end] = [0, 10]

      const result = calculator.randomTime(start, end)
      expect(result.getTime()).to.be.at.least(plusMinutes(now, start).getTime())
      expect(result.getTime()).to.be.at.most(plusMinutes(now, end).getTime())
    })

    it('randomTime with equal start and end', () => {
      const [start, end] = [5, 5]

      const result = calculator.randomTime(start, end)
      expect(result.getTime()).to.be.at.least(plusMinutes(now, start).getTime())
      expect(result.getTime()).to.be.at.most(plusMinutes(now, end).getTime())
    })

    it('fromDate with executeAt in the past', () => {
      const executeAt = plusMinutes(now, -1)
      const minDelay = 5

      const result = calculator.fromDate(executeAt, minDelay)
      expect(result.getTime()).to.be.equal(plusMinutes(now, minDelay).getTime())
    })

    it('fromDate with executeAt in the future', () => {
      const executeAt = plusMinutes(now, 6)
      const minDelay = 5

      const result = calculator.fromDate(executeAt, minDelay)
      expect(result.getTime()).to.be.equal(executeAt.getTime())
    })

    it('fromDate with executeAt within minDelay', () => {
      const executeAt = plusMinutes(now, 4)
      const minDelay = 5

      const result = calculator.fromDate(executeAt, minDelay)
      expect(result.getTime()).to.be.equal(plusMinutes(now, minDelay).getTime())
    })
  })
})
