import type { RoundSettings, Round } from '../database'

describe('RoundSettings', () => {
  const defaultSettings: RoundSettings = {
    allowTies: false,
    anonymousResults: false,
    host_as_participant: false,
    show_processing: false,
  }

  test('includes host_as_participant field', () => {
    expect(defaultSettings.host_as_participant).toBe(false)
  })

  test('includes show_processing field', () => {
    expect(defaultSettings.show_processing).toBe(false)
  })

  test('all settings default to false', () => {
    expect(Object.values(defaultSettings).every(v => v === false)).toBe(true)
  })

  test('settings object is assignable to Round.settings', () => {
    const round = {
      id: 'test-id',
      join_code: 'ABC123',
      prompt: 'Test prompt',
      description: null,
      options: ['A', 'B'],
      settings: defaultSettings,
      status: 'setup' as const,
      host_token: 'token',
      created_at: new Date().toISOString(),
    } satisfies Round

    expect(round.settings.host_as_participant).toBe(false)
    expect(round.settings.show_processing).toBe(false)
  })
})
