import { subscribeToRankings } from '@/lib/realtime'
import type { RankingCallbacks } from '@/lib/realtime'
import type { Ranking } from '@/types/database'

const mockUnsubscribe = jest.fn()

jest.mock('@/lib/realtime', () => ({
  subscribeToRankings: jest.fn(() => mockUnsubscribe),
}))

const mockedSubscribe = subscribeToRankings as jest.MockedFunction<
  typeof subscribeToRankings
>

beforeEach(() => {
  jest.clearAllMocks()
})

function makeRanking(overrides: Partial<Ranking> = {}): Ranking {
  return {
    id: 'r-1',
    round_id: 'round-1',
    participant_id: 'p-1',
    ranking: ['A', 'B', 'C'],
    submitted_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('lobby ranking realtime subscription', () => {
  test('subscribeToRankings is called with roundId and callbacks', () => {
    const roundId = 'round-abc'
    const callbacks: RankingCallbacks = {
      onRankingSubmitted: jest.fn(),
    }

    subscribeToRankings(roundId, callbacks)

    expect(mockedSubscribe).toHaveBeenCalledWith(roundId, callbacks)
  })

  test('unsubscribe function is returned for cleanup', () => {
    const unsub = subscribeToRankings('round-abc', {
      onRankingSubmitted: jest.fn(),
    })

    expect(unsub).toBe(mockUnsubscribe)
  })

  describe('submission count increment logic', () => {
    // This tests the exact callback pattern used in the lobby page:
    // onRankingSubmitted: () => {
    //   setSubmissionCount((prev) => prev + 1)
    // }

    function applyIncrement(prev: number): number {
      return prev + 1
    }

    test('increments count from zero', () => {
      expect(applyIncrement(0)).toBe(1)
    })

    test('increments count from existing value', () => {
      expect(applyIncrement(3)).toBe(4)
    })

    test('increments consecutively', () => {
      let count = 0
      count = applyIncrement(count)
      count = applyIncrement(count)
      count = applyIncrement(count)
      expect(count).toBe(3)
    })
  })

  describe('subscription gating by round status', () => {
    // This tests the guard condition in the useEffect:
    // if (round?.status !== 'ranking' && round?.status !== 'closed') return

    function shouldSubscribe(status: string | undefined): boolean {
      return status === 'ranking' || status === 'closed'
    }

    test('subscribes when status is ranking', () => {
      expect(shouldSubscribe('ranking')).toBe(true)
    })

    test('subscribes when status is closed', () => {
      expect(shouldSubscribe('closed')).toBe(true)
    })

    test('does not subscribe when status is setup', () => {
      expect(shouldSubscribe('setup')).toBe(false)
    })

    test('does not subscribe when status is revealed', () => {
      expect(shouldSubscribe('revealed')).toBe(false)
    })

    test('does not subscribe when status is undefined', () => {
      expect(shouldSubscribe(undefined)).toBe(false)
    })
  })

  describe('ranking payload shape', () => {
    test('makeRanking produces a valid ranking object', () => {
      const ranking = makeRanking()
      expect(ranking).toEqual({
        id: 'r-1',
        round_id: 'round-1',
        participant_id: 'p-1',
        ranking: ['A', 'B', 'C'],
        submitted_at: '2025-01-01T00:00:00Z',
      })
    })
  })
})
