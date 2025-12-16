export type FreshRSSItemsResponse = {
  auth?: number
  items?: FreshRSSItem[]
}

export type FreshRSSItem = {
  id: string
  is_read: number
}
