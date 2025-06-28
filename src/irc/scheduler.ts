import { CronJob } from 'cron'
import { Config, CronHandlerConfig, TimerHandlerConfig } from '../types/config'
import { ExecutionTimeCalculator, ScheduleHandler, Scheduler, SendFunction } from '../types/irc'
import { Storage } from '../types/storage'
import { DefaultDateProvider, plusMinutes } from '../util/date'

export class RandomExecutionTimeCalculator implements ExecutionTimeCalculator {
  constructor(private dateProvider = new DefaultDateProvider()) {}

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

export class JobScheduler implements Scheduler {
  private cronJobs: CronJob[] = []
  private timerJobs: NodeJS.Timeout[] = []

  constructor(
    private send: SendFunction,
    private config: Config,
    private storage: Storage,
    private timeCalculator: ExecutionTimeCalculator = new RandomExecutionTimeCalculator()
  ) {}

  addCronJob = (handler: ScheduleHandler, config: CronHandlerConfig) => {
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

  addTimerJob = (handler: ScheduleHandler, config: TimerHandlerConfig) => {
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
