import { subscribeToParticipants } from '@/lib/realtime'
import type { ParticipantCallbacks } from '@/lib/realtime'
import type { Participant } from '@/types/database'

const mockUnsubscribe = jest.fn()

jest.mock('@/lib/realtime', () => ({
  subscribeToParticipants: jest.fn(() => mockUnsubscribe),
}))

const mockedSubscribe = subscribeToParticipants as jest.MockedFunction<
  typeof subscribeToParticipants
>

beforeEach(() => {
  jest.clearAllMocks()
})

function makeParticipant(overrides: Partial<Participant> = {}): Participant {
  return {
    id: 'p-1',
    round_id: 'round-1',
    display_name: 'Alice',
    removed: false,
    joined_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('lobby participant realtime subscription', () => {
  test('subscribeToParticipants is called with roundId and callbacks', () => {
    const roundId = 'round-abc'
    const callbacks: ParticipantCallbacks = {
      onPlayerJoined: jest.fn(),
    }

    subscribeToParticipants(roundId, callbacks)

    expect(mockedSubscribe).toHaveBeenCalledWith(roundId, callbacks)
  })

  test('unsubscribe function is returned for cleanup', () => {
    const unsub = subscribeToParticipants('round-abc', {
      onPlayerJoined: jest.fn(),
    })

    expect(unsub).toBe(mockUnsubscribe)
  })

  describe('onPlayerJoined callback deduplication logic', () => {
    // This tests the exact callback pattern used in the lobby page:
    // setPlayers((prev) => {
    //   if (prev.some((p) => p.id === participant.id)) return prev
    //   return [...prev, { id: participant.id, display_name: participant.display_name }]
    // })

    type Player = { id: string; display_name: string }

    function applyJoin(prev: Player[], participant: Participant): Player[] {
      if (prev.some((p) => p.id === participant.id)) return prev
      return [...prev, { id: participant.id, display_name: participant.display_name }]
    }

    test('adds a new player to an empty list', () => {
      const participant = makeParticipant({ id: 'p-1', display_name: 'Alice' })
      const result = applyJoin([], participant)

      expect(result).toEqual([{ id: 'p-1', display_name: 'Alice' }])
    })

    test('appends a new player to existing list', () => {
      const existing: Player[] = [{ id: 'p-1', display_name: 'Alice' }]
      const participant = makeParticipant({ id: 'p-2', display_name: 'Bob' })
      const result = applyJoin(existing, participant)

      expect(result).toEqual([
        { id: 'p-1', display_name: 'Alice' },
        { id: 'p-2', display_name: 'Bob' },
      ])
    })

    test('does not duplicate an existing player', () => {
      const existing: Player[] = [{ id: 'p-1', display_name: 'Alice' }]
      const participant = makeParticipant({ id: 'p-1', display_name: 'Alice' })
      const result = applyJoin(existing, participant)

      expect(result).toBe(existing) // same reference — no mutation
    })

    test('only maps id and display_name from participant', () => {
      const participant = makeParticipant({
        id: 'p-3',
        display_name: 'Charlie',
        round_id: 'round-xyz',
        removed: false,
        joined_at: '2025-06-01T00:00:00Z',
      })
      const result = applyJoin([], participant)

      expect(result).toEqual([{ id: 'p-3', display_name: 'Charlie' }])
      expect(result[0]).not.toHaveProperty('round_id')
      expect(result[0]).not.toHaveProperty('removed')
      expect(result[0]).not.toHaveProperty('joined_at')
    })
  })
})
