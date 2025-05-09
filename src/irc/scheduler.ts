import { CronJob } from 'cron'
import { IConfig, ICronHandlerConfig, ITimerHandlerConfig } from '../types/config'
import { IExecutionTimeCalculator, IScheduleHandler, IScheduler, SendFunction } from '../types/irc'
import { IStorage } from '../types/storage'

export class ExecutionTimeCalculator implements IExecutionTimeCalculator {
  randomTime = (start: number, end: number) => {
    const executeAt = new Date()
    const randomDelay = start + Math.floor(Math.random() * (end - start))
    executeAt.setMinutes(executeAt.getMinutes() + randomDelay)

    return executeAt
  }

  fromDate = (existingDate: Date, minDelay: number) => {
    const minBuffer = new Date()
    minBuffer.setMinutes(minBuffer.getMinutes() + minDelay)

    return existingDate < minBuffer ? minBuffer : existingDate
  }
}

export class Scheduler implements IScheduler {
  constructor(
    private send: SendFunction,
    private config: IConfig,
    private storage: IStorage,
    private timeCalculator: IExecutionTimeCalculator = new ExecutionTimeCalculator()
  ) {}

  addCronJob = (handler: IScheduleHandler, config: ICronHandlerConfig) => {
    new CronJob(
      config.cron,
      () => {
        handler({ send: this.send, config: this.config, storage: this.storage })
      },
      null,
      true,
      'Etc/UTC'
    )
  }

  addTimerJob = (handler: IScheduleHandler, config: ITimerHandlerConfig) => {
    const run = async () => {
      const timer = await this.storage.getTimer(config.id)

      const executeAt =
        timer && !timer.executed
          ? this.timeCalculator.fromDate(timer.executeAt, 5)
          : this.timeCalculator.randomTime(config.timerRangeStart, config.timerRangeEnd)

      await this.storage.upsertTimer(config.id, executeAt, false)

      setTimeout(async () => {
        await this.storage.upsertTimer(config.id, executeAt, true)
        handler({ send: this.send, config: this.config, storage: this.storage })
        run()
      }, executeAt.getTime() - new Date().getTime())
    }

    run()
  }
}
