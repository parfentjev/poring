export interface IStorage {
  connect: () => void
  getRandomMessage: (category: string) => Promise<IStorageMessage | null>
  increaseMessageUsageCount: (messageId: string) => void
}

export interface IStorageMessage {
  id: string
  text: string
}
