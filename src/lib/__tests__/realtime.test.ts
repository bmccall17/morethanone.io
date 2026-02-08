import { subscribeToRound } from '../realtime'

let capturedCallback: (payload: unknown) => void
const mockRemoveChannel = jest.fn()
const mockSubscribe = jest.fn()

const mockChannel = {
  on: jest.fn((...args: unknown[]) => {
    capturedCallback = args[2] as (payload: unknown) => void
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

    capturedCallback({
      new: { status: 'voting' },
      old: { status: 'waiting' },
    })

    expect(onStatusChange).toHaveBeenCalledWith('voting')
  })

  test('does not call onStatusChange when status is unchanged', () => {
    const onStatusChange = jest.fn()
    subscribeToRound('round-123', { onStatusChange })

    capturedCallback({
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
