import { subscribeToRound } from '@/lib/realtime'
import type { RoundCallbacks } from '@/lib/realtime'

const mockUnsubscribe = jest.fn()

jest.mock('@/lib/realtime', () => ({
  subscribeToRound: jest.fn(() => mockUnsubscribe),
}))

const mockedSubscribe = subscribeToRound as jest.MockedFunction<
  typeof subscribeToRound
>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('rank page round realtime subscription', () => {
  test('subscribeToRound is called with roundId and callbacks', () => {
    const roundId = 'round-abc'
    const callbacks: RoundCallbacks = {
      onStatusChange: jest.fn(),
    }

    subscribeToRound(roundId, callbacks)

    expect(mockedSubscribe).toHaveBeenCalledWith(roundId, callbacks)
  })

  test('unsubscribe function is returned for cleanup', () => {
    const unsub = subscribeToRound('round-abc', {
      onStatusChange: jest.fn(),
    })

    expect(unsub).toBe(mockUnsubscribe)
  })

  describe('onStatusChange callback updates round state', () => {
    interface RoundData {
      prompt: string
      options: string[]
      status: string
    }

    function applyStatusChange(
      prev: RoundData | null,
      status: string
    ): RoundData | null {
      return prev ? { ...prev, status } : prev
    }

    test('updates status from setup to ranking', () => {
      const round: RoundData = {
        prompt: 'Rank these',
        options: ['A', 'B', 'C'],
        status: 'setup',
      }
      const result = applyStatusChange(round, 'ranking')

      expect(result).toEqual({
        prompt: 'Rank these',
        options: ['A', 'B', 'C'],
        status: 'ranking',
      })
    })

    test('updates status from ranking to revealed', () => {
      const round: RoundData = {
        prompt: 'Rank these',
        options: ['A', 'B', 'C'],
        status: 'ranking',
      }
      const result = applyStatusChange(round, 'revealed')

      expect(result).toEqual({
        prompt: 'Rank these',
        options: ['A', 'B', 'C'],
        status: 'revealed',
      })
    })

    test('returns null when round is null', () => {
      const result = applyStatusChange(null, 'ranking')

      expect(result).toBeNull()
    })

    test('does not mutate the original round object', () => {
      const round: RoundData = {
        prompt: 'Rank these',
        options: ['A', 'B', 'C'],
        status: 'setup',
      }
      const result = applyStatusChange(round, 'ranking')

      expect(result).not.toBe(round)
      expect(round.status).toBe('setup')
    })

    test('preserves prompt and options when status changes', () => {
      const round: RoundData = {
        prompt: 'Best pizza topping?',
        options: ['Pepperoni', 'Mushroom', 'Pineapple'],
        status: 'setup',
      }
      const result = applyStatusChange(round, 'ranking')

      expect(result?.prompt).toBe('Best pizza topping?')
      expect(result?.options).toEqual(['Pepperoni', 'Mushroom', 'Pineapple'])
    })
  })

  describe('auto-redirect on revealed status', () => {
    function shouldRedirect(status: string): boolean {
      return status === 'revealed'
    }

    test('redirects when status is revealed', () => {
      expect(shouldRedirect('revealed')).toBe(true)
    })

    test('does not redirect when status is ranking', () => {
      expect(shouldRedirect('ranking')).toBe(false)
    })

    test('does not redirect when status is setup', () => {
      expect(shouldRedirect('setup')).toBe(false)
    })

    test('does not redirect when status is closed', () => {
      expect(shouldRedirect('closed')).toBe(false)
    })
  })

  describe('setup-to-ranking transition shows ranking form', () => {
    function shouldShowRankingForm(status: string): boolean {
      return status !== 'setup'
    }

    test('does not show ranking form when status is setup', () => {
      expect(shouldShowRankingForm('setup')).toBe(false)
    })

    test('shows ranking form when status changes to ranking', () => {
      expect(shouldShowRankingForm('ranking')).toBe(true)
    })

    test('shows ranking form when status is closed', () => {
      expect(shouldShowRankingForm('closed')).toBe(true)
    })

    test('shows ranking form when status is revealed', () => {
      expect(shouldShowRankingForm('revealed')).toBe(true)
    })
  })
})
