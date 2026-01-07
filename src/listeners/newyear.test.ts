import { afterEach, describe, expect, test } from 'bun:test'
import { newYearHandler, yearProgressHandler } from './newyear'
import type { Clock } from '../types/utils'
import { TZDate } from '@date-fns/tz'
import { createIrcEventContext } from '../test/fixtures'
import { ClockMock } from '../test/mocks'

describe('newyear.ts', () => {
  let out: string[] = []
  const utc = 'UTC'

  afterEach(() => (out = []))

  describe('newYearHandler', () => {
    const defaultTarget = '#channel'
    const defaultText = '!ny'

    const context = (options?: { target?: string; text?: string; clock?: Clock }) => {
      const context = createIrcEventContext((s) => out.push(s))
      context.message.params = [options?.target ?? defaultTarget]
      context.message.text = options?.text ?? defaultText
      context.clock = options?.clock ?? context.clock

      return context
    }

    const expected = (countdown: string, year = 2027) =>
      `PRIVMSG ${defaultTarget} :Just ${countdown} until \x02${year}\x02! 🎄☃️🎉`

    test('require command', async () => {
      const event = context({ text: 'some regular text message' })
      await newYearHandler(event)

      expect(out).toBeEmpty()
    })

    test('respond to both commands', async () => {
      const shortCommand = context({ text: '!ny' })
      const fullCommand = context({ text: '!newyear' })

      for (const message of [shortCommand, fullCommand]) {
        await newYearHandler(message)
      }

      expect(out).toHaveLength(2)
    })

    test('respond to target', async () => {
      const targetChannel = context({ target: '#someChannel' })
      const targetUser = context({ target: 'someUser' })

      for (const message of [targetChannel, targetUser]) {
        await newYearHandler(message)
      }

      expect(out[0]).toStartWith('PRIVMSG #someChannel :')
      expect(out[1]).toStartWith('PRIVMSG someUser :')
    })

    test('start of the year', async () => {
      const clock = new ClockMock(new TZDate(2026, 0, 1, 0, 0, utc))
      await newYearHandler(context({ clock }))

      expect(out).toEqual([expected('365d 0h 0m 0s')])
    })

    test('middle of the year', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, 1, utc))
      await newYearHandler(context({ clock }))

      expect(out).toEqual([expected('182d 11h 59m 59s')])
    })

    test('end of the year', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 31, 23, 59, 59, utc))
      await newYearHandler(context({ clock }))

      expect(out).toEqual([expected('0d 0h 0m 1s')])
    })

    test('calculate days correctly', async () => {
      const messages = [
        context({ clock: new ClockMock(new TZDate(2026, 11, 31, 0, 0, 0, utc)) }),
        context({ clock: new ClockMock(new TZDate(2026, 11, 27, 0, 0, 0, utc)) }),
        context({ clock: new ClockMock(new TZDate(2026, 11, 17, 0, 0, 0, utc)) }),
        context({ clock: new ClockMock(new TZDate(2026, 11, 2, 0, 0, 0, utc)) }),
        context({ clock: new ClockMock(new TZDate(2026, 11, 1, 0, 0, 0, utc)) }),
      ]

      for (const message of messages) {
        await newYearHandler(message)
      }

      expect(out).toContain(expected('1d 0h 0m 0s'))
      expect(out).toContain(expected('5d 0h 0m 0s'))
      expect(out).toContain(expected('15d 0h 0m 0s'))
      expect(out).toContain(expected('30d 0h 0m 0s'))
      expect(out).toContain(expected('31d 0h 0m 0s'))
    })

    test('calculate hours correctly', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 31, 12, 0, 0, utc))
      await newYearHandler(context({ clock }))

      expect(out).toEqual([expected('0d 12h 0m 0s')])
    })

    test('calculate minutes correctly', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 31, 23, 30, 0, utc))
      await newYearHandler(context({ clock }))

      expect(out).toEqual([expected('0d 0h 30m 0s')])
    })

    test('calculate seconds correctly', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 31, 23, 59, 30, utc))
      await newYearHandler(context({ clock }))

      expect(out).toEqual([expected('0d 0h 0m 30s')])
    })

    test('with offset=8', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 13, 29, 55, utc))
      await newYearHandler(context({ text: '!ny 8', clock }))

      expect(out).toEqual([expected('1d 2h 30m 5s')])
    })

    test('with offset=+8', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 13, 29, 55, utc))
      await newYearHandler(context({ text: '!ny +8', clock }))

      expect(out).toEqual([expected('1d 2h 30m 5s')])
    })

    test('with offset=+08', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 13, 29, 55, utc))
      await newYearHandler(context({ text: '!ny +08', clock }))

      expect(out).toEqual([expected('1d 2h 30m 5s')])
    })

    test('with offset=+08:00', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 13, 29, 55, utc))
      await newYearHandler(context({ text: '!ny +08:00', clock }))

      expect(out).toEqual([expected('1d 2h 30m 5s')])
    })

    test('with offset=+08:30', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 12, 59, 55, utc))
      await newYearHandler(context({ text: '!ny +08:30', clock }))

      expect(out).toEqual([expected('1d 2h 30m 5s')])
    })

    test('with offset=-8', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 13, 29, 55, utc))
      await newYearHandler(context({ text: '!ny -8', clock }))

      expect(out).toEqual([expected('1d 18h 30m 5s')])
    })

    test('with offset=-08', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 13, 29, 55, utc))
      await newYearHandler(context({ text: '!ny -08', clock }))

      expect(out).toEqual([expected('1d 18h 30m 5s')])
    })

    test('with offset=-08:00', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 13, 29, 55, utc))
      await newYearHandler(context({ text: '!ny -08:00', clock }))

      expect(out).toEqual([expected('1d 18h 30m 5s')])
    })

    test('with offset=-08:30', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 30, 12, 59, 55, utc))
      await newYearHandler(context({ text: '!ny -08:30', clock }))

      expect(out).toEqual([expected('1d 19h 30m 5s')])
    })

    test('show correct year with boundary crossed', async () => {
      const messages = [
        context({ text: '!ny +02:00', clock: new ClockMock(new TZDate(2026, 11, 31, 23, 0, utc)) }),
        context({ text: '!ny -02:00', clock: new ClockMock(new TZDate(2027, 0, 1, 1, 0, utc)) }),
      ]

      for (const message of messages) {
        await newYearHandler(message)
      }

      expect(out).toContain(expected('364d 23h 0m 0s', 2028))
      expect(out).toContain(expected('0d 1h 0m 0s'))
    })

    test('handle invalid offset', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 31, 12, 0, 0, utc))
      const invalidOffsets = ['!ny invalid', '!ny +99:00', '!ny +02:abc123']

      for (const text of invalidOffsets) {
        await newYearHandler(context({ text, clock }))
      }

      expect(out[0]).toBe(expected('0d 12h 0m 0s'))
      expect(out[1]).toBe(expected('361d 9h 0m 0s', 2028))
      expect(out[2]).toBe(expected('0d 10h 0m 0s'))
    })
  })

  describe('yearProgressHandler', () => {
    const defaultTarget = '#channel'
    const defaultText = '!year'

    const context = (options?: { target?: string; text?: string; clock?: Clock }) => {
      const context = createIrcEventContext((s) => out.push(s))
      context.message.params = [options?.target ?? defaultTarget]
      context.message.text = options?.text ?? defaultText
      context.clock = options?.clock ?? context.clock

      return context
    }

    const expected = (progress: string, year = 2026) =>
      `PRIVMSG ${defaultTarget} :Year ${year} progress: \u0002${progress}\u0002 👀🚧💃`

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
      const clock = new ClockMock(new TZDate(2026, 0, 1, 0, 0, utc))
      await yearProgressHandler(context({ clock }))

      expect(out).toEqual([expected('0.00%')])
    })

    test('50.00% at the middle', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ clock }))

      expect(out).toEqual([expected('50.00%')])
    })

    test('99.99% at the end', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 31, 23, 59, 59, utc))
      await yearProgressHandler(context({ clock }))

      expect(out).toEqual([expected('99.99%')])
    })

    test('with offset=8', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year 8', clock }))

      expect(out).toEqual([expected('50.09%')])
    })

    test('with offset=+8', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +8', clock }))

      expect(out).toEqual([expected('50.09%')])
    })

    test('with offset=+08', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +08', clock }))

      expect(out).toEqual([expected('50.09%')])
    })

    test('with offset=+08:00', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +08:00', clock }))

      expect(out).toEqual([expected('50.09%')])
    })

    test('with offset=+08:30', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year +08:30', clock }))

      expect(out).toEqual([expected('50.10%')])
    })

    test('with offset=-8', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -8', clock }))

      expect(out).toEqual([expected('49.91%')])
    })

    test('with offset=-08', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -08', clock }))

      expect(out).toEqual([expected('49.91%')])
    })

    test('with offset=-08:00', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -08:00', clock }))

      expect(out).toEqual([expected('49.91%')])
    })

    test('with offset=-08:30', async () => {
      const clock = new ClockMock(new TZDate(2026, 6, 2, 12, 0, utc))
      await yearProgressHandler(context({ text: '!year -08:30', clock }))

      expect(out).toEqual([expected('49.90%')])
    })

    test('show correct year with boundary crossed', async () => {
      const clock = new ClockMock(new TZDate(2025, 11, 31, 23, 0, utc))
      await yearProgressHandler(context({ text: '!year +09:00', clock }))

      expect(out[0]).toContain('Year 2026')
    })

    test('handle invalid offset', async () => {
      const clock = new ClockMock(new TZDate(2026, 11, 31, 12, 0, 0, utc))
      const invalidOffsets = ['!year invalid', '!year +99:00', '!year +02:abc123']

      for (const text of invalidOffsets) {
        await yearProgressHandler(context({ text, clock }))
      }

      expect(out[0]).toBe(expected('99.86%'))
      expect(out[1]).toBe(expected('0.99%', 2027))
      expect(out[2]).toBe(expected('99.89%'))
    })
  })
})
