import type { FreshRssConfig } from '../types/config'
import type { CronJobContext } from '../types/irc'
import type { FreshRSSItemsResponse } from '../types/listeners'

const maxPossibleId = BigInt('18446744073709551615')
let maxKnownId: bigint | undefined

export const rssJob = async (context: CronJobContext) => {
  if (await shouldSendAlert(context.config.freshRss)) {
    context.send(`PRIVMSG ${context.config.freshRss.target} :${context.config.freshRss.notification}`)
  }
}

const shouldSendAlert = async (config: FreshRssConfig) => {
  // on first run, fetch last 50 items (API default limit) to initialize maxKnownId
  // on subsequent runs, fetch only items newer than maxKnownId
  const filterKey = maxKnownId ? 'since_id' : 'max_id'
  const filterValue = maxKnownId ?? maxPossibleId

  const response = await fetchItems(config, { key: filterKey, value: filterValue })
  if (!response || !response.items || response.items.length === 0) return false

  maxKnownId = response.items.reduce((max, item) => {
    const itemId = BigInt(item.id)

    return itemId > max ? itemId : max
  }, BigInt(response.items[0]!.id))

  return response.items.some((i) => i.is_read === 0)
}

const fetchItems = async (config: FreshRssConfig, filter: { key: 'since_id' | 'max_id'; value: bigint }) => {
  const path = `/api/fever.php?api&items&${filter.key}=${filter.value}`

  const formData = new FormData()
  formData.append('api_key', config.apiKey)

  return fetch(config.url + path, {
    method: 'post',
    body: formData,
    signal: AbortSignal.timeout(10_000),
  }).then(async (response) => {
    if (!response || response.status !== 200) {
      console.error(`FreshRSS API error: ${response?.status}`)
      return
    }

    const json = <FreshRSSItemsResponse>await response.json()
    if (json.auth !== 1) {
      console.error(`FreshRSS API unauthorized: ${json}`)
      return
    }

    return json
  })
}
