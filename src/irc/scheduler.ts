import { CronJob } from 'cron'
import { IBotConfig, ICronHandlerConfig, ITimerHandlerConfig } from '../types/config'
import { IExecutionTimeCalculator, IScheduleHandler, IScheduler, SendFunction } from '../types/irc'
import { IStorage } from '../types/storage'
import { DateProvider, plusMinutes } from '../util/date'

export class ExecutionTimeCalculator implements IExecutionTimeCalculator {
  constructor(private dateProvider = new DateProvider()) {}

  randomTime = (start: number, end: number) => {
    const randomDelay = start + Math.floor(Math.random() * (end - start))
    const executeAt = plusMinutes(this.dateProvider.now(), randomDelay)

    return executeAt
  }

  fromDate = (existingDate: Date, minDelay: number) => {
    const minBuffer = plusMinutes(this.dateProvider.now(), minDelay)

    return existingDate < minBuffer ? minBuffer : existingDate
  }
}

export class Scheduler implements IScheduler {
  private cronJobs: CronJob[] = []
  private timerJobs: NodeJS.Timeout[] = []

  constructor(
    private send: SendFunction,
    private config: IBotConfig,
    private storage: IStorage,
    private timeCalculator: IExecutionTimeCalculator = new ExecutionTimeCalculator()
  ) {}

  addCronJob = (handler: IScheduleHandler, config: ICronHandlerConfig) => {
    const job = new CronJob(
      config.expression,
      () => {
        handler({ send: this.send, config: this.config, storage: this.storage })
      },
      null,
      true,
      'Etc/UTC'
    )

    this.cronJobs.push(job)
  }

  addTimerJob = (handler: IScheduleHandler, config: ITimerHandlerConfig) => {
    const run = async () => {
      const timer = await this.storage.getTimer(config.id)

      const executeAt =
        timer && !timer.executed
          ? this.timeCalculator.fromDate(timer.executeAt, 1)
          : this.timeCalculator.randomTime(config.timerRangeStart, config.timerRangeEnd)

      await this.storage.upsertTimer(config.id, executeAt, false)

      const job = setTimeout(async () => {
        await this.storage.upsertTimer(config.id, executeAt, true)
        handler({ send: this.send, config: this.config, storage: this.storage })
        run()
      }, executeAt.getTime() - new Date().getTime())
      this.timerJobs.push(job)
    }

    run()
  }

  clearCronJobs = () => {
    this.cronJobs.forEach(async (j) => await j.stop())
    this.cronJobs = []
  }

  clearTimerJobs = () => {
    this.timerJobs.forEach((j) => j.close())
    this.timerJobs = []
  }
}
