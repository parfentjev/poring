import { expect } from 'chai'
import { describe, it } from 'node:test'
import { ExecutionTimeCalculator } from '../../src/irc/scheduler'

describe('Scheduler', () => {
  describe('ExecutionTimeCalculator', () => {
    const calculator = new ExecutionTimeCalculator()

    it('randomTime within the specified range', () => {
      const [start, end] = [10, 11]
      const now = new Date()
      const result = calculator.randomTime(start, end)

      expect(result.getTime()).to.be.at.least(now.getTime() + start * 1000 * 60)
      expect(result.getTime()).to.be.at.most(now.getTime() + end * 1000 * 60)
    })

    it('randomTime within the specified large range', () => {
      const [start, end] = [1440, 4320]
      const now = new Date()
      const result = calculator.randomTime(start, end)

      expect(result.getTime()).to.be.at.least(now.getTime() + start * 1000 * 60)
      expect(result.getTime()).to.be.at.most(now.getTime() + end * 1000 * 60)
    })

    it('randomTime with start = 0', () => {
      const [start, end] = [0, 10]
      const now = new Date()

      const result = calculator.randomTime(start, end)

      expect(result.getTime()).to.be.at.least(now.getTime() + start * 1000 * 60)
      expect(result.getTime()).to.be.at.most(now.getTime() + end * 1000 * 60)
    })

    it('randomTime with equal start and end', () => {
      const [start, end] = [5, 5]
      const now = new Date()

      const result = calculator.randomTime(start, end)
      expect(result.getTime()).to.be.at.least(now.getTime() + start * 1000 * 60)
      expect(result.getTime()).to.be.at.most(now.getTime() + end * 1000 * 60)
    })

    it('fromDate with executeAt in the past', () => {
      const executeAt = new Date()
      executeAt.setMinutes(executeAt.getMinutes() - 1)

      const result = calculator.fromDate(executeAt, 5)
      expect(result.getTime()).to.be.closeTo(new Date().getTime() + 1000 * 60 * 5, 1)
    })

    it('fromDate with executeAt in the future', () => {
      const executeAt = new Date()
      executeAt.setMinutes(executeAt.getMinutes() + 6)

      const result = calculator.fromDate(executeAt, 5)
      expect(result).to.be.equal(executeAt)
    })

    it('fromDate with executeAt within minDelay', () => {
      const executeAt = new Date()
      executeAt.setMinutes(executeAt.getMinutes() + 4)

      const result = calculator.fromDate(executeAt, 5)
      expect(result.getTime()).to.be.closeTo(new Date().getTime() + 1000 * 60 * 5, 1)
    })
  })
})
