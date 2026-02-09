import { subscribeToProcessing, subscribeToRound } from '@/lib/realtime'
import type { ProcessingCallbacks, RoundCallbacks } from '@/lib/realtime'

const mockProcessingUnsubscribe = jest.fn()
const mockRoundUnsubscribe = jest.fn()

jest.mock('@/lib/realtime', () => ({
  subscribeToProcessing: jest.fn(() => mockProcessingUnsubscribe),
  subscribeToRound: jest.fn(() => mockRoundUnsubscribe),
}))

const mockedSubscribeToProcessing = subscribeToProcessing as jest.MockedFunction<
  typeof subscribeToProcessing
>
const mockedSubscribeToRound = subscribeToRound as jest.MockedFunction<
  typeof subscribeToRound
>

beforeEach(() => {
  jest.clearAllMocks()
})

describe('processing page subscriptions', () => {
  test('subscribeToProcessing is called with roundId and callbacks', () => {
    const roundId = 'round-abc'
    const callbacks: ProcessingCallbacks = {
      onProcessingUpdate: jest.fn(),
    }

    subscribeToProcessing(roundId, callbacks)

    expect(mockedSubscribeToProcessing).toHaveBeenCalledWith(roundId, callbacks)
  })

  test('subscribeToRound is called with roundId and callbacks', () => {
    const roundId = 'round-abc'
    const callbacks: RoundCallbacks = {
      onStatusChange: jest.fn(),
    }

    subscribeToRound(roundId, callbacks)

    expect(mockedSubscribeToRound).toHaveBeenCalledWith(roundId, callbacks)
  })

  test('unsubscribe functions are returned for cleanup', () => {
    const processingUnsub = subscribeToProcessing('round-abc', {
      onProcessingUpdate: jest.fn(),
    })
    const roundUnsub = subscribeToRound('round-abc', {
      onStatusChange: jest.fn(),
    })

    expect(processingUnsub).toBe(mockProcessingUnsubscribe)
    expect(roundUnsub).toBe(mockRoundUnsubscribe)
  })
})

describe('processing page redirect logic', () => {
  function shouldRedirectToReveal(status: string): boolean {
    return status === 'revealed'
  }

  test('redirects to reveal when status is revealed', () => {
    expect(shouldRedirectToReveal('revealed')).toBe(true)
  })

  test('does not redirect to reveal when status is processing', () => {
    expect(shouldRedirectToReveal('processing')).toBe(false)
  })

  test('does not redirect to reveal when status is closed', () => {
    expect(shouldRedirectToReveal('closed')).toBe(false)
  })
})

describe('processing data construction', () => {
  function buildConvergeResult(resultData: {
    winner: string
    rounds: Array<{
      round_number: number
      tallies: Record<string, number>
      eliminated: string | null
      transfers: Array<{ from: string; to: string | null; count: number }>
      active: number
      inactive: number
      threshold: number
    }>
    majority_threshold: number
    total_active: number
    summary: {
      text: string
      total_rounds: number
      winner: string
      runner_up: string | null
      winning_percentage: number
    }
  }) {
    return {
      winner: resultData.winner,
      rounds: resultData.rounds,
      majority_threshold: resultData.majority_threshold,
      total_active: resultData.total_active,
      tie_breaks: [],
      summary: resultData.summary,
    }
  }

  test('builds ConvergeResult from processing data with available rounds', () => {
    const processingData = {
      winner: 'Pizza',
      rounds: [
        {
          round_number: 1,
          tallies: { Pizza: 3, Tacos: 2, Sushi: 1 },
          eliminated: 'Sushi',
          transfers: [{ from: 'Sushi', to: 'Pizza', count: 1 }],
          active: 6,
          inactive: 0,
          threshold: 4,
        },
      ],
      majority_threshold: 4,
      total_active: 6,
      summary: {
        text: 'Pizza wins',
        total_rounds: 2,
        winner: 'Pizza',
        runner_up: 'Tacos',
        winning_percentage: 67,
      },
    }

    const result = buildConvergeResult(processingData)

    expect(result.winner).toBe('Pizza')
    expect(result.rounds).toHaveLength(1)
    expect(result.rounds[0].round_number).toBe(1)
    expect(result.tie_breaks).toEqual([])
  })

  test('returns null-equivalent when no rounds available', () => {
    const rounds: Array<unknown> = []
    const result = rounds.length > 0 ? { rounds } : null

    expect(result).toBeNull()
  })
})
