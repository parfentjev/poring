import { writeFileSync } from 'node:fs'

const OUTPUT_FILE = './dist/metadata.json'

const gitCommitHash = process.env['GIT_COMMIT_HASH']
if (gitCommitHash === undefined || gitCommitHash === '') {
  throw new Error('GIT_COMMIT_HASH argument is missing')
}

writeFileSync('./dist/metadata.json', JSON.stringify({ gitCommitHash }))
