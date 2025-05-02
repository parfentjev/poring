import { IStorageConfig } from '../types/config'
import mariadb from 'mariadb'
import { IStorage, IStorageMessage } from '../types/storage'

export class Storage implements IStorage {
  constructor(private config: IStorageConfig, private conn: mariadb.Connection | null = null) {}

  connect = async () => {
    console.log('[stroage] Connecting to the database')

    this.conn = await mariadb.createConnection({
      host: this.config.host,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
    })

    console.log('[stroage] Connected to the database')

    this.conn.on('error', () => {
      console.error('[stroage] Caught and error')
      this.handleError()
    })
  }

  private handleError = async () => {
    if (this.conn) {
      this.conn.end().catch(() => {})
      this.conn = null
    }

    try {
      await this.connect()
    } catch (error) {
      console.error('[stroage] Failed to connect to the database')

      setTimeout(() => this.handleError(), 10000)
    }
  }

  private query = async <T>(sql: string, ...params: any[]): Promise<T | null> => {
    if (this.conn === null) return null

    try {
      return (await this.conn!.query(sql, params)) as T
    } catch (error) {
      console.error('[storage] Query failed:', error)

      return null
    }
  }

  getRandomMessage = async (category: string) => {
    const data = await this.query<IStorageMessage[]>(
      `
      SELECT id, text 
      FROM messages 
      WHERE category = ? AND active = TRUE
      ORDER BY usage_count ASC, RAND() 
      LIMIT 1;
      `,
      category
    )

    return data ? data[0] : null
  }

  increaseMessageUsageCount = async (messageId: string) => {
    await this.query(
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
