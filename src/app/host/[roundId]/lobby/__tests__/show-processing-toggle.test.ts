import type { RoundSettings } from '@/types/database'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: false,
  show_processing: false,
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

describe('show processing toggle logic', () => {
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
    function applyToggle(prev: RoundData | null, checked: boolean): RoundData | null {
      return prev ? { ...prev, settings: { ...prev.settings, show_processing: checked } } : prev
    }

    test('sets show_processing to true', () => {
      const round = makeRound()
      const result = applyToggle(round, true)
      expect(result?.settings.show_processing).toBe(true)
    })

    test('sets show_processing to false', () => {
      const round = makeRound({ settings: { ...defaultSettings, show_processing: true } })
      const result = applyToggle(round, false)
      expect(result?.settings.show_processing).toBe(false)
    })

    test('preserves other settings when toggling', () => {
      const round = makeRound({
        settings: { allowTies: true, anonymousResults: true, host_as_participant: true, show_processing: false },
      })
      const result = applyToggle(round, true)
      expect(result?.settings).toEqual({
        allowTies: true,
        anonymousResults: true,
        host_as_participant: true,
        show_processing: true,
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
      const checked = settings?.show_processing ?? false
      expect(checked).toBe(false)
    })

    test('reads true from settings', () => {
      const settings: RoundSettings = { ...defaultSettings, show_processing: true }
      const checked = settings?.show_processing ?? false
      expect(checked).toBe(true)
    })

    test('reads false from settings', () => {
      const settings: RoundSettings = { ...defaultSettings, show_processing: false }
      const checked = settings?.show_processing ?? false
      expect(checked).toBe(false)
    })
  })
})
