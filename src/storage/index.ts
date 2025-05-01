import { IStorageConfig } from '../types/config'
import mariadb from 'mariadb'
import { IStorage, IStorageMessage } from '../types/storage'

export class Storage implements IStorage {
  constructor(private config: IStorageConfig, private conn: mariadb.Connection | null = null) {}

  connect = async () => {
    this.conn = await mariadb.createConnection({
      host: this.config.host,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
    })
  }

  private query = async <T>(sql: string, ...params: any[]): Promise<T> => {
    return (await this.conn!.query(sql, params)) as T
  }

  getRandomMessage = async (category: string) => {
    return (
      await this.query<IStorageMessage[]>(
        `
      SELECT id, text 
      FROM messages 
      WHERE category = ? AND active = TRUE
      ORDER BY usage_count ASC, RAND() 
      LIMIT 1;
      `,
        category
      )
    )[0]
  }

  increaseMessageUsageCount = async (messageId: string) => {
    return await this.query<void>(
      `
      UPDATE messages
      SET usage_count = usage_count + 1, 
      last_used = NOW()
      WHERE id = ?;
      `,
      messageId
    )
  }
}
