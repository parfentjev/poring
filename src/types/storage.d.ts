export interface IStorage {
  connect: () => void
  getRandomMessage: (category: string) => Promise<IStorageMessage>
  increaseMessageUsageCount: (messageId: string) => Promise<void>
}

export interface IStorageMessage {
  id: string
  text: string
}
