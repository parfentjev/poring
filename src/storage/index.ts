import { IStorageConfig } from '../types/config'
import mariadb from 'mariadb'
import { IStorage, IStorageMessage, IStorageTimer, QueryData } from '../types/storage'

export class Storage implements IStorage {
  constructor(private config: IStorageConfig, private conn: mariadb.Connection | null = null) {}

  connect = async () => {
    this.conn = await mariadb.createConnection({
      host: this.config.host,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
    })

    this.conn.on('error', () => {
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
      setTimeout(() => this.handleError(), 1000)
    }
  }

  private execute = async (sql: string, ...params: any[]): Promise<any | null> => {
    if (this.conn === null) return null

    try {
      return await this.conn.query(sql, params)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  getRandomMessage = async (category: string): QueryData<IStorageMessage> => {
    const data = await this.execute(
      `
      SELECT id, text 
      FROM messages 
      WHERE category = ? AND active = TRUE
      ORDER BY usage_count ASC, RAND() 
      LIMIT 1;
      `,
      category
    )

    if (!data || data.length !== 1) return null

    return {
      id: data[0].id,
      text: data[0].text,
    }
  }

  increaseMessageUsageCount = async (messageId: string) => {
    await this.execute(
      `
      UPDATE messages
      SET usage_count = usage_count + 1, 
      last_used = NOW()
      WHERE id = ?;
      `,
      messageId
    )
  }

  upsertTimer = async (id: string, executeAt: Date, executed: boolean) => {
    await this.execute(
      `
      INSERT INTO timers (id, execute_at, executed)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE execute_at = VALUES(execute_at), executed = VALUES(executed)
      `,
      id,
      executeAt.toISOString().slice(0, 19).replace('T', ' '),
      executed
    )
  }

  getTimer = async (id: string): QueryData<IStorageTimer> => {
    const data = await this.execute(
      `
      SELECT id, execute_at, executed
      FROM timers
      WHERE id = ?
      LIMIT 1
      `,
      id
    )

    if (!data || data.length !== 1) return null

    return {
      id: data[0].id,
      executeAt: new Date(data[0].execute_at),
      executed: Boolean(data[0].executed),
    }
  }
}
