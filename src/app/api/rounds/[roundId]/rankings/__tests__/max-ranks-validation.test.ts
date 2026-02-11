import type { RoundSettings } from '@/types/database'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: false,
  show_processing: false,
  bot_count: 0,
}

describe('rankings API max_ranks server-side validation', () => {
  // Tests the exact validation pattern used in the route:
  // if (settings?.max_ranks && ranking.length > settings.max_ranks)
  function validateMaxRanks(
    ranking: string[],
    settings: RoundSettings | null
  ): { valid: boolean; error?: string } {
    if (settings?.max_ranks && ranking.length > settings.max_ranks) {
      return { valid: false, error: `Rankings exceed the maximum of ${settings.max_ranks}` }
    }
    return { valid: true }
  }

  test('accepts ranking when no max_ranks set', () => {
    const ranking = ['A', 'B', 'C', 'D', 'E']
    const result = validateMaxRanks(ranking, defaultSettings)
    expect(result.valid).toBe(true)
  })

  test('accepts ranking when null settings', () => {
    const ranking = ['A', 'B', 'C']
    const result = validateMaxRanks(ranking, null)
    expect(result.valid).toBe(true)
  })

  test('accepts ranking at exactly max_ranks', () => {
    const settings: RoundSettings = { ...defaultSettings, max_ranks: 3 }
    const ranking = ['A', 'B', 'C']
    const result = validateMaxRanks(ranking, settings)
    expect(result.valid).toBe(true)
  })

  test('accepts ranking under max_ranks', () => {
    const settings: RoundSettings = { ...defaultSettings, max_ranks: 3 }
    const ranking = ['A', 'B']
    const result = validateMaxRanks(ranking, settings)
    expect(result.valid).toBe(true)
  })

  test('rejects ranking exceeding max_ranks', () => {
    const settings: RoundSettings = { ...defaultSettings, max_ranks: 3 }
    const ranking = ['A', 'B', 'C', 'D']
    const result = validateMaxRanks(ranking, settings)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Rankings exceed the maximum of 3')
  })

  test('rejects ranking far exceeding max_ranks', () => {
    const settings: RoundSettings = { ...defaultSettings, max_ranks: 2 }
    const ranking = ['A', 'B', 'C', 'D', 'E']
    const result = validateMaxRanks(ranking, settings)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Rankings exceed the maximum of 2')
  })

  test('accepts single ranking with max_ranks of 1', () => {
    const settings: RoundSettings = { ...defaultSettings, max_ranks: 1 }
    const ranking = ['A']
    const result = validateMaxRanks(ranking, settings)
    expect(result.valid).toBe(true)
  })

  test('rejects two rankings with max_ranks of 1', () => {
    const settings: RoundSettings = { ...defaultSettings, max_ranks: 1 }
    const ranking = ['A', 'B']
    const result = validateMaxRanks(ranking, settings)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Rankings exceed the maximum of 1')
  })

  test('max_ranks undefined behaves like no limit', () => {
    const settings: RoundSettings = { ...defaultSettings, max_ranks: undefined }
    const ranking = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const result = validateMaxRanks(ranking, settings)
    expect(result.valid).toBe(true)
  })
})
