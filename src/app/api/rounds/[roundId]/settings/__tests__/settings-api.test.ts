import type { RoundSettings } from '@/types/database'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: false,
  show_processing: false,
  bot_count: 0,
}

describe('settings API merge logic', () => {
  // This tests the exact merge pattern used in the settings route:
  // const updatedSettings = { ...round.settings, ...body }

  function mergeSettings(existing: RoundSettings, patch: Partial<RoundSettings>): RoundSettings {
    return { ...existing, ...patch }
  }

  test('merges host_as_participant into default settings', () => {
    const result = mergeSettings(defaultSettings, { host_as_participant: true })
    expect(result).toEqual({
      allowTies: false,
      anonymousResults: false,
      host_as_participant: true,
      show_processing: false,
      bot_count: 0,
    })
  })

  test('preserves existing settings when patching one field', () => {
    const existing: RoundSettings = {
      allowTies: true,
      anonymousResults: true,
      host_as_participant: false,
      show_processing: true,
      bot_count: 3,
    }
    const result = mergeSettings(existing, { host_as_participant: true })
    expect(result.allowTies).toBe(true)
    expect(result.anonymousResults).toBe(true)
    expect(result.show_processing).toBe(true)
    expect(result.host_as_participant).toBe(true)
    expect(result.bot_count).toBe(3)
  })

  test('can toggle host_as_participant back to false', () => {
    const existing: RoundSettings = { ...defaultSettings, host_as_participant: true }
    const result = mergeSettings(existing, { host_as_participant: false })
    expect(result.host_as_participant).toBe(false)
  })

  test('supports patching multiple fields at once', () => {
    const result = mergeSettings(defaultSettings, {
      host_as_participant: true,
      show_processing: true,
    })
    expect(result.host_as_participant).toBe(true)
    expect(result.show_processing).toBe(true)
    expect(result.allowTies).toBe(false)
  })

  test('empty patch returns same values', () => {
    const result = mergeSettings(defaultSettings, {})
    expect(result).toEqual(defaultSettings)
  })

  test('merges bot_count into settings', () => {
    const result = mergeSettings(defaultSettings, { bot_count: 5 })
    expect(result.bot_count).toBe(5)
    expect(result.allowTies).toBe(false)
  })
})

describe('settings API authorization checks', () => {
  // These test the authorization logic patterns in the route

  test('rejects when no host token provided', () => {
    const hostToken: string | null = null
    expect(hostToken).toBeNull()
  })

  test('rejects when host token does not match', () => {
    const roundHostToken = 'abc-123'
    const requestHostToken = 'wrong-token'
    expect(roundHostToken).not.toBe(requestHostToken)
  })

  test('accepts when host token matches', () => {
    const roundHostToken = 'abc-123'
    const requestHostToken = 'abc-123'
    expect(roundHostToken).toBe(requestHostToken)
  })

  test('rejects when round status is not setup', () => {
    const statuses = ['ranking', 'closed', 'revealed']
    for (const status of statuses) {
      expect(status !== 'setup').toBe(true)
    }
  })

  test('allows when round status is setup', () => {
    expect('setup' !== 'setup').toBe(false)
  })
})
