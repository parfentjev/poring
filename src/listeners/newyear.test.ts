import { afterEach, describe, expect, test } from 'bun:test'
import { yearProgressHandler } from './newyear'
import type { IrcEventContext } from '../types/irc'
import type { Clock } from '../types/utils'
import { TZDate } from '@date-fns/tz'

let out: string[] = []

const defaultContext = () =>
  <IrcEventContext>{
    send: (string: string) => out.push(string),
    message: {
      prefix: '',
      command: '',
      params: [],
      text: '',
    },
    config: {
      server: {
        host: '',
        port: 0,
      },
      user: {
        nickname: '',
        channels: [],
        sasl: {
          enabled: false,
          username: undefined,
          password: undefined,
        },
      },
      listener: {
        freshRSS: {
          url: '',
          apiKey: '',
          notification: '',
          target: '',
        },
      },
    },
    clock: new TZDateClockMock(),
  }

describe('newyear.ts', () => {
  afterEach(() => (out = []))

  describe('yearProgressHandler', () => {
    const defaultTarget = '#channel'
    const defaultText = '!year'
    const utc = 'UTC'

    const context = (options?: { target?: string; text?: string; clock?: Clock }) => {
      const context = defaultContext()
      context.message.params = [options?.target ?? defaultTarget]
      context.message.text = options?.text ?? defaultText
      context.clock = options?.clock ?? context.clock

      return context
    }

    const expectedMessage = (progress: string) =>
      `PRIVMSG ${defaultTarget} :Year 2026 progress: \u0002${progress}\u0002 👀🚧💃`

    test('require !year', async () => {
      const regularText = context({ text: 'some regular text message' })
      const yeaText = context({ text: '!yea' })
      const noExclamationSign = context({ text: 'year' })

      for (const message of [regularText, yeaText, noExclamationSign]) {
        await yearProgressHandler(message)
      }

      expect(out).toBeEmpty()
    })

    test('respond to target', async () => {
      const targetChannel = context({ target: '#someChannel' })
      const targetUser = context({ target: 'someUser' })

      for (const message of [targetChannel, targetUser]) {
        await yearProgressHandler(message)
      }

      expect(out[0]).toStartWith('PRIVMSG #someChannel :')
      expect(out[1]).toStartWith('PRIVMSG someUser :')
    })

    test('0.00% at the start', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 0, 1, 0, 0, utc))
      await yearProgressHandler(context({ clock }))

      expect(out).toEqual([expectedMessage('0.00%')])
    })

    test('50.00% at the middle', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ clock }))

      expect(out).toEqual([expectedMessage('50.00%')])
    })

    test('99.99% at the end', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 11, 31, 23, 59, 59, utc))
      await yearProgressHandler(context({ clock }))

      expect(out).toEqual([expectedMessage('99.99%')])
    })

    test('with offset=8', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year 8', clock }))

      expect(out).toEqual([expectedMessage('50.09%')])
    })

    test('with offset=+8', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +8', clock }))

      expect(out).toEqual([expectedMessage('50.09%')])
    })

    test('with offset=+08', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +08', clock }))

      expect(out).toEqual([expectedMessage('50.09%')])
    })

    test('with offset=+08:00', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +08:00', clock }))

      expect(out).toEqual([expectedMessage('50.09%')])
    })

    test('with offset=+08:30', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +08:30', clock }))

      expect(out).toEqual([expectedMessage('50.10%')])
    })

    test('with offset=-8', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -8', clock }))

      expect(out).toEqual([expectedMessage('49.91%')])
    })

    test('with offset=-08', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -08', clock }))

      expect(out).toEqual([expectedMessage('49.91%')])
    })

    test('with offset=-08:00', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -08:00', clock }))

      expect(out).toEqual([expectedMessage('49.91%')])
    })

    test('with offset=-08:30', async () => {
      const clock = new TZDateClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -08:30', clock }))

      expect(out).toEqual([expectedMessage('49.90%')])
    })

    test('show correct year for different timezone', async () => {
      const clock = new TZDateClockMock(new TZDate(2025, 11, 31, 23, 0, utc))
      await yearProgressHandler(context({ text: '!year +09:00', clock }))

      expect(out[0]).toContain('Year 2026')
    })
  })
})

class TZDateClockMock implements Clock {
  constructor(private baseDate = TZDate.tz('UTC')) {}

  now = (offset: string): TZDate => {
    return this.baseDate.withTimeZone(offset)
  }
}
