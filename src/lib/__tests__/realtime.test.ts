import {
  subscribeToRound,
  subscribeToParticipants,
  subscribeToRankings,
} from '../realtime'

let capturedCallbacks: Array<(payload: unknown) => void>
const mockRemoveChannel = jest.fn()
const mockSubscribe = jest.fn()

const mockChannel = {
  on: jest.fn((...args: unknown[]) => {
    capturedCallbacks.push(args[2] as (payload: unknown) => void)
    return mockChannel
  }),
  subscribe: jest.fn(() => {
    mockSubscribe()
    return mockChannel
  }),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: () => mockChannel,
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  }),
}))

beforeEach(() => {
  capturedCallbacks = []
  jest.clearAllMocks()
})

describe('subscribeToRound', () => {
  test('subscribes to postgres_changes for the given round', () => {
    const onStatusChange = jest.fn()
    subscribeToRound('round-123', { onStatusChange })

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rounds',
        filter: 'id=eq.round-123',
      },
      expect.any(Function)
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  test('calls onStatusChange when status changes', () => {
    const onStatusChange = jest.fn()
    subscribeToRound('round-123', { onStatusChange })

    capturedCallbacks[0]({
      new: { status: 'voting' },
      old: { status: 'waiting' },
    })

    expect(onStatusChange).toHaveBeenCalledWith('voting')
  })

  test('does not call onStatusChange when status is unchanged', () => {
    const onStatusChange = jest.fn()
    subscribeToRound('round-123', { onStatusChange })

    capturedCallbacks[0]({
      new: { status: 'voting' },
      old: { status: 'voting' },
    })

    expect(onStatusChange).not.toHaveBeenCalled()
  })

  test('returns an unsubscribe function that removes the channel', () => {
    const onStatusChange = jest.fn()
    const unsubscribe = subscribeToRound('round-123', { onStatusChange })

    unsubscribe()

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
  })
})

describe('subscribeToParticipants', () => {
  test('subscribes to INSERT events on participants table', () => {
    const onPlayerJoined = jest.fn()
    subscribeToParticipants('round-456', { onPlayerJoined })

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'participants',
        filter: 'round_id=eq.round-456',
      },
      expect.any(Function)
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  test('calls onPlayerJoined with the new participant', () => {
    const onPlayerJoined = jest.fn()
    subscribeToParticipants('round-456', { onPlayerJoined })

    const participant = {
      id: 'p-1',
      round_id: 'round-456',
      display_name: 'Alice',
      removed: false,
      joined_at: '2025-01-01T00:00:00Z',
    }
    capturedCallbacks[0]({ new: participant })

    expect(onPlayerJoined).toHaveBeenCalledWith(participant)
  })

  test('returns an unsubscribe function that removes the channel', () => {
    const onPlayerJoined = jest.fn()
    const unsubscribe = subscribeToParticipants('round-456', { onPlayerJoined })

    unsubscribe()

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
  })
})

describe('subscribeToRankings', () => {
  test('subscribes to INSERT and UPDATE events on rankings table', () => {
    const onRankingSubmitted = jest.fn()
    subscribeToRankings('round-789', { onRankingSubmitted })

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'rankings',
        filter: 'round_id=eq.round-789',
      },
      expect.any(Function)
    )
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rankings',
        filter: 'round_id=eq.round-789',
      },
      expect.any(Function)
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  test('calls onRankingSubmitted on INSERT', () => {
    const onRankingSubmitted = jest.fn()
    subscribeToRankings('round-789', { onRankingSubmitted })

    const ranking = {
      id: 'r-1',
      round_id: 'round-789',
      participant_id: 'p-1',
      ranking: ['A', 'B', 'C'],
      submitted_at: '2025-01-01T00:00:00Z',
    }
    capturedCallbacks[0]({ new: ranking })

    expect(onRankingSubmitted).toHaveBeenCalledWith(ranking)
  })

  test('calls onRankingSubmitted on UPDATE', () => {
    const onRankingSubmitted = jest.fn()
    subscribeToRankings('round-789', { onRankingSubmitted })

    const ranking = {
      id: 'r-1',
      round_id: 'round-789',
      participant_id: 'p-1',
      ranking: ['B', 'A', 'C'],
      submitted_at: '2025-01-01T00:01:00Z',
    }
    capturedCallbacks[1]({ new: ranking })

    expect(onRankingSubmitted).toHaveBeenCalledWith(ranking)
  })

  test('returns an unsubscribe function that removes the channel', () => {
    const onRankingSubmitted = jest.fn()
    const unsubscribe = subscribeToRankings('round-789', { onRankingSubmitted })

    unsubscribe()

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
  })
})
