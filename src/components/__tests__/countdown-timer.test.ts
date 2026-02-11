import { computeDeadline } from '../CountdownTimer'

describe('computeDeadline', () => {
  test('calculates deadline correctly for 5 minutes', () => {
    const start = '2025-01-01T12:00:00.000Z'
    const deadline = computeDeadline(start, 5)
    expect(deadline).toBe('2025-01-01T12:05:00.000Z')
  })

  test('calculates deadline correctly for 1 minute', () => {
    const start = '2025-01-01T12:00:00.000Z'
    const deadline = computeDeadline(start, 1)
    expect(deadline).toBe('2025-01-01T12:01:00.000Z')
  })

  test('calculates deadline correctly for 60 minutes', () => {
    const start = '2025-01-01T12:00:00.000Z'
    const deadline = computeDeadline(start, 60)
    expect(deadline).toBe('2025-01-01T13:00:00.000Z')
  })

  test('handles fractional minutes', () => {
    const start = '2025-01-01T12:00:00.000Z'
    const deadline = computeDeadline(start, 0.5)
    expect(deadline).toBe('2025-01-01T12:00:30.000Z')
  })

  test('returns a valid ISO string', () => {
    const start = '2025-06-15T08:30:00.000Z'
    const deadline = computeDeadline(start, 10)
    expect(() => new Date(deadline)).not.toThrow()
    expect(new Date(deadline).toISOString()).toBe(deadline)
  })

  test('deadline is always after start time', () => {
    const start = '2025-01-01T12:00:00.000Z'
    for (const minutes of [1, 5, 10, 30, 60]) {
      const deadline = computeDeadline(start, minutes)
      expect(new Date(deadline).getTime()).toBeGreaterThan(new Date(start).getTime())
    }
  })
})
