import type { RoundSettings, Round } from '../database'

describe('RoundSettings', () => {
  const defaultSettings: RoundSettings = {
    allowTies: false,
    anonymousResults: false,
    host_as_participant: false,
    show_processing: false,
    bot_count: 0,
  }

  test('includes host_as_participant field', () => {
    expect(defaultSettings.host_as_participant).toBe(false)
  })

  test('includes show_processing field', () => {
    expect(defaultSettings.show_processing).toBe(false)
  })

  test('includes bot_count field', () => {
    expect(defaultSettings.bot_count).toBe(0)
  })

  test('timer_minutes is optional and defaults to undefined', () => {
    expect(defaultSettings.timer_minutes).toBeUndefined()
  })

  test('timer_minutes can be set to a number', () => {
    const withTimer: RoundSettings = { ...defaultSettings, timer_minutes: 5 }
    expect(withTimer.timer_minutes).toBe(5)
  })

  test('all boolean settings default to false', () => {
    const { bot_count, timer_minutes, ...booleanSettings } = defaultSettings
    expect(Object.values(booleanSettings).every(v => v === false)).toBe(true)
    expect(bot_count).toBe(0)
    expect(timer_minutes).toBeUndefined()
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
      current_processing_round: 0,
      reveal_view_state: { view: 'animation' as const, animationRound: 0 },
      ranking_started_at: null,
      created_at: new Date().toISOString(),
    } satisfies Round

    expect(round.settings.host_as_participant).toBe(false)
    expect(round.settings.show_processing).toBe(false)
    expect(round.settings.bot_count).toBe(0)
    expect(round.ranking_started_at).toBeNull()
  })
})
