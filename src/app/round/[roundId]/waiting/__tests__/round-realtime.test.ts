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

  describe('auto-redirect to processing when show_processing is enabled', () => {
    function shouldRedirectToProcessing(
      status: string,
      showProcessing: boolean
    ): boolean {
      return status === 'processing' && showProcessing
    }

    test('redirects to processing when status is processing and show_processing is true', () => {
      expect(shouldRedirectToProcessing('processing', true)).toBe(true)
    })

    test('does not redirect to processing when show_processing is false', () => {
      expect(shouldRedirectToProcessing('processing', false)).toBe(false)
    })

    test('does not redirect to processing when status is not processing', () => {
      expect(shouldRedirectToProcessing('ranking', true)).toBe(false)
      expect(shouldRedirectToProcessing('revealed', true)).toBe(false)
      expect(shouldRedirectToProcessing('closed', true)).toBe(false)
    })
  })
})
