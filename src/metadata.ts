import { readFileSync } from 'fs'
import type { Logger } from 'pino'

export type Metadata = {
  gitCommitHash: string
}

export function loadMetadata(logger: Logger, source: string): Metadata {
  let gitCommitHash = 'unknown'
  try {
    const metadataFile = readFile(source)
    if (metadataFile.gitCommitHash) {
      gitCommitHash = metadataFile.gitCommitHash
    }
  } catch (err) {
    logger.error({ err }, 'failed to read metadata file')
  }

  return { gitCommitHash }
}

function readFile(source: string) {
  const file = new URL(source, import.meta.url)
  const contents = readFileSync(file, { encoding: 'utf-8' })

  return JSON.parse(contents)
}
