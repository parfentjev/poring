import path from 'path'
import { IIRCBot } from '../types/irc'
import { readdirSync } from 'fs'
import { IEventListener } from '../types/listeners'

export class ScriptManager {
  constructor(private bot: IIRCBot, private scriptsDirectory: string) {
    this.loadModulesFromDisk()
  }

  private loadModulesFromDisk = () => {
    readdirSync(this.scriptsDirectory)
      .filter((file) => file.endsWith('.js'))
      .forEach((file) => this.loadModule(file))
  }

  private loadModule = (scriptPath: string) => {
    const absolutePath = path.resolve(this.scriptsDirectory, scriptPath)

    try {
      const module: IEventListener = require(absolutePath)
      this.bot.addEventListener(module.event, module.handler)
      console.log('Loaded', absolutePath)
    } catch (e) {
      console.log('Failed to load', absolutePath, e)
    }
  }
}
