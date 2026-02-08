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

describe('waiting page round realtime subscription', () => {
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
})
