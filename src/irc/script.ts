import path from 'path'
import { IIRCBot, IScheduler, IScriptManager } from '../types/irc'
import { readdirSync, watch } from 'fs'
import { IScript } from '../types/irc'
import { ICronHandlerConfig, ITimerHandlerConfig } from '../types/config'

export class ScriptManager implements IScriptManager {
  private fsWatchTimeout?: NodeJS.Timeout

  constructor(private scriptsDirectory: string, private bot: IIRCBot, private scheduler: IScheduler) {
    this.loadScriptsFromDisk()

    watch(this.scriptsDirectory, () => {
      if (this.fsWatchTimeout) clearTimeout(this.fsWatchTimeout)

      this.fsWatchTimeout = setTimeout(() => {
        this.bot.clearEventListeners()
        this.scheduler.clearCronJobs()
        this.scheduler.clearTimerJobs()

        this.loadScriptsFromDisk()
      }, 1000)
    })
  }

  private loadScriptsFromDisk = () => {
    readdirSync(this.scriptsDirectory)
      .filter((file) => file.endsWith('.js'))
      .forEach((file) => this.loadScript(file))
  }

  private loadScript = (scriptPath: string) => {
    const absolutePath = path.resolve(this.scriptsDirectory, scriptPath)

    try {
      delete require.cache[absolutePath]
      const module: IScript = require(absolutePath)

      if (module.config.type === 'eventHandler' && module.config.event && module.eventHandler) {
        this.bot.addEventListener(module.config.event, module.eventHandler)
      } else if (module.config.type === 'cronJob' && module.scheduleHandler && module.config.cron) {
        this.scheduler.addCronJob(module.scheduleHandler, module.config.cron as ICronHandlerConfig)
      } else if (module.config.type === 'timerJob' && module.scheduleHandler && module.config.timer) {
        this.scheduler.addTimerJob(module.scheduleHandler, module.config.timer as ITimerHandlerConfig)
      } else {
        console.error('Invalid script', absolutePath)

        return
      }

      console.log('Loaded script', absolutePath)
    } catch (error) {
      console.error('Failed to load script', absolutePath, error)
    }
  }
}
