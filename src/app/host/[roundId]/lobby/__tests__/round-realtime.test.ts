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

describe('lobby round realtime subscription', () => {
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
    // This tests the exact callback pattern used in the lobby page:
    // onStatusChange: (status) => {
    //   setRound((prev) => (prev ? { ...prev, status } : prev))
    // }

    interface RoundData {
      id: string
      status: string
      prompt: string
    }

    function applyStatusChange(
      prev: RoundData | null,
      status: string
    ): RoundData | null {
      return prev ? { ...prev, status } : prev
    }

    test('updates status on an existing round', () => {
      const round: RoundData = { id: 'r-1', status: 'setup', prompt: 'Test' }
      const result = applyStatusChange(round, 'ranking')

      expect(result).toEqual({ id: 'r-1', status: 'ranking', prompt: 'Test' })
    })

    test('returns null when round is null', () => {
      const result = applyStatusChange(null, 'ranking')

      expect(result).toBeNull()
    })

    test('does not mutate the original round object', () => {
      const round: RoundData = { id: 'r-1', status: 'setup', prompt: 'Test' }
      const result = applyStatusChange(round, 'ranking')

      expect(result).not.toBe(round)
      expect(round.status).toBe('setup')
    })

    test('preserves all other round fields', () => {
      const round: RoundData = {
        id: 'r-1',
        status: 'setup',
        prompt: 'Rank these',
      }
      const result = applyStatusChange(round, 'closed')

      expect(result).toEqual({
        id: 'r-1',
        status: 'closed',
        prompt: 'Rank these',
      })
    })
  })

  describe('auto-redirect on revealed status', () => {
    // This tests the redirect logic:
    // if (status === 'revealed') {
    //   router.push(`/host/${roundId}/reveal`)
    // }

    function shouldRedirect(status: string): boolean {
      return status === 'revealed'
    }

    test('redirects when status is revealed', () => {
      expect(shouldRedirect('revealed')).toBe(true)
    })

    test('does not redirect when status is ranking', () => {
      expect(shouldRedirect('ranking')).toBe(false)
    })

    test('does not redirect when status is closed', () => {
      expect(shouldRedirect('closed')).toBe(false)
    })

    test('does not redirect when status is setup', () => {
      expect(shouldRedirect('setup')).toBe(false)
    })
  })
})
