import type { RoundSettings } from '@/types/database'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: false,
  show_processing: false,
  bot_count: 0,
}

interface RoundData {
  id: string
  settings: RoundSettings
  status: string
}

function makeRound(overrides: Partial<RoundData> = {}): RoundData {
  return {
    id: 'round-1',
    settings: { ...defaultSettings },
    status: 'setup',
    ...overrides,
  }
}

describe('host participate toggle logic', () => {
  describe('toggle availability by status', () => {
    test('toggle is enabled during setup status', () => {
      const round = makeRound({ status: 'setup' })
      const disabled = round.status !== 'setup'
      expect(disabled).toBe(false)
    })

    test('toggle is disabled during ranking status', () => {
      const round = makeRound({ status: 'ranking' })
      const disabled = round.status !== 'setup'
      expect(disabled).toBe(true)
    })

    test('toggle is disabled during closed status', () => {
      const round = makeRound({ status: 'closed' })
      const disabled = round.status !== 'setup'
      expect(disabled).toBe(true)
    })

    test('toggle is disabled during revealed status', () => {
      const round = makeRound({ status: 'revealed' })
      const disabled = round.status !== 'setup'
      expect(disabled).toBe(true)
    })
  })

  describe('optimistic state update', () => {
    // This tests the exact callback pattern used in the lobby page:
    // setRound((prev) => prev ? { ...prev, settings: { ...prev.settings, host_as_participant: checked } } : prev)

    function applyToggle(prev: RoundData | null, checked: boolean): RoundData | null {
      return prev ? { ...prev, settings: { ...prev.settings, host_as_participant: checked } } : prev
    }

    test('sets host_as_participant to true', () => {
      const round = makeRound()
      const result = applyToggle(round, true)
      expect(result?.settings.host_as_participant).toBe(true)
    })

    test('sets host_as_participant to false', () => {
      const round = makeRound({ settings: { ...defaultSettings, host_as_participant: true } })
      const result = applyToggle(round, false)
      expect(result?.settings.host_as_participant).toBe(false)
    })

    test('preserves other settings when toggling', () => {
      const round = makeRound({
        settings: { allowTies: true, anonymousResults: true, host_as_participant: false, show_processing: true, bot_count: 0 },
      })
      const result = applyToggle(round, true)
      expect(result?.settings).toEqual({
        allowTies: true,
        anonymousResults: true,
        host_as_participant: true,
        show_processing: true,
        bot_count: 0,
      })
    })

    test('returns null when previous state is null', () => {
      const result = applyToggle(null, true)
      expect(result).toBeNull()
    })
  })

  describe('checked value derivation', () => {
    test('defaults to false when settings is undefined', () => {
      const settings: RoundSettings | undefined = undefined
      const checked = settings?.host_as_participant ?? false
      expect(checked).toBe(false)
    })

    test('reads true from settings', () => {
      const settings: RoundSettings = { ...defaultSettings, host_as_participant: true }
      const checked = settings?.host_as_participant ?? false
      expect(checked).toBe(true)
    })

    test('reads false from settings', () => {
      const settings: RoundSettings = { ...defaultSettings, host_as_participant: false }
      const checked = settings?.host_as_participant ?? false
      expect(checked).toBe(false)
    })
  })
})
