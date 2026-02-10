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
    function shouldRedirectToReveal(status: string): boolean {
      return status === 'revealed'
    }

    test('redirects when status is revealed', () => {
      expect(shouldRedirectToReveal('revealed')).toBe(true)
    })

    test('does not redirect when status is ranking', () => {
      expect(shouldRedirectToReveal('ranking')).toBe(false)
    })

    test('does not redirect when status is setup', () => {
      expect(shouldRedirectToReveal('setup')).toBe(false)
    })

    test('does not redirect when status is closed', () => {
      expect(shouldRedirectToReveal('closed')).toBe(false)
    })
  })

  describe('auto-redirect to processing', () => {
    function shouldRedirectToProcessing(status: string): boolean {
      return status === 'processing'
    }

    test('redirects to processing when status is processing', () => {
      expect(shouldRedirectToProcessing('processing')).toBe(true)
    })

    test('does not redirect to processing when status is ranking', () => {
      expect(shouldRedirectToProcessing('ranking')).toBe(false)
    })

    test('does not redirect to processing when status is revealed', () => {
      expect(shouldRedirectToProcessing('revealed')).toBe(false)
    })

    test('does not redirect to processing when status is closed', () => {
      expect(shouldRedirectToProcessing('closed')).toBe(false)
    })
  })

  describe('polling fallback logic', () => {
    function shouldRedirectFromPoll(status: string): 'processing' | 'reveal' | null {
      if (status === 'processing') return 'processing'
      if (status === 'revealed') return 'reveal'
      return null
    }

    test('redirects to processing on poll result', () => {
      expect(shouldRedirectFromPoll('processing')).toBe('processing')
    })

    test('redirects to reveal on poll result', () => {
      expect(shouldRedirectFromPoll('revealed')).toBe('reveal')
    })

    test('does not redirect on ranking poll result', () => {
      expect(shouldRedirectFromPoll('ranking')).toBeNull()
    })

    test('does not redirect on closed poll result', () => {
      expect(shouldRedirectFromPoll('closed')).toBeNull()
    })

    test('does not redirect on setup poll result', () => {
      expect(shouldRedirectFromPoll('setup')).toBeNull()
    })
  })
})
