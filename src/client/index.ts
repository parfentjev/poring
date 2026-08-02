import type { Config } from '../config.js'

class Client {
  private readonly config: Config

  constructor(config: Config) {
    this.config = config
  }
}

class Connection {
  private readonly config: Config

  constructor(config: Config) {
    this.config = config
  }
}
