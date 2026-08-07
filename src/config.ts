const DEFAULT_USERNAME = 'poring'
const DEFAULT_REALNAME = 'https://github.com/parfentjev/poring'

export type Config = {
  readonly client: ClientConfig
  readonly listener: ListenerConfig
}

export type ClientConfig = {
  readonly serverAddress: string
  readonly serverPort: number
}

export type ListenerConfig = {
  readonly core: ListenerCoreConfig
  readonly sasl: ListenerSaslConfig
  readonly raweceek: ListenerRaweceekConfig
}

export type ListenerCoreConfig = {
  readonly nickname: string
  readonly username: string
  readonly realname: string
  readonly autojoin: string | undefined
}

export type ListenerSaslConfig = {
  readonly enabled: boolean
  readonly username: string | undefined
  readonly password: string | undefined
}

export type ListenerRaweceekConfig = {
  readonly serviceUrl: string
  readonly listenOn: string[]
}

export function loadConfig(processEnv: NodeJS.ProcessEnv): Config {
  const env = createProcessEnvReader(processEnv)

  return {
    client: {
      serverAddress: env.required('CLIENT_SERVER_ADDRESS'),
      serverPort: +env.required('CLIENT_SERVER_PORT'),
    },
    listener: {
      core: {
        nickname: env.required('LISTENER_CORE_NICKNAME'),
        username: env.optional('LISTENER_CORE_USERNAME') ?? DEFAULT_USERNAME,
        realname: env.optional('LISTENER_CORE_REALNAME') ?? DEFAULT_REALNAME,
        autojoin: env.optional('LISTENER_CORE_AUTOJOIN'),
      },
      sasl: {
        enabled: env.optional('LISTENER_SASL_ENABLED') === 'true',
        username: env.optional('LISTENER_SASL_USERNAME'),
        password: env.optional('LISTENER_SASL_PASSWORD'),
      },
      raweceek: {
        serviceUrl: env.optional('LISTENER_RAWECEEK_SERVICE_URL') ?? 'https://raweceek.eu',
        listenOn: env.optional('LISTENER_RAWECEEK_LISTEN_ON')?.split(',') ?? [],
      },
    },
  }
}

function createProcessEnvReader(processEnv: NodeJS.ProcessEnv) {
  function optional(key: string): string | undefined {
    return processEnv[key]
  }

  function required(key: string): string {
    const value = processEnv[key]
    if (value === undefined) {
      throw new Error(`environment variable ${key} is undefined`)
    }

    return value
  }

  return { optional, required }
}
