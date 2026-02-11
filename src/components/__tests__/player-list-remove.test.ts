import type { Participant } from '@/types/database'

type Player = { id: string; display_name: string }

// Mirrors the showRemoveButton logic in PlayerList
function shouldShowRemoveButton(
  isHost: boolean | undefined,
  roundId: string | undefined,
  roundStatus: string | undefined
): boolean {
  return !!(isHost && roundId && (roundStatus === 'setup' || roundStatus === 'ranking'))
}

// Mirrors the onPlayerRemoved callback in the lobby page
function applyRemoval(prev: Player[], participant: Participant): Player[] {
  return prev.filter((p) => p.id !== participant.id)
}

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

describe('PlayerList remove button visibility', () => {
  test('shows remove button for host during setup', () => {
    expect(shouldShowRemoveButton(true, 'round-1', 'setup')).toBe(true)
  })

  test('shows remove button for host during ranking', () => {
    expect(shouldShowRemoveButton(true, 'round-1', 'ranking')).toBe(true)
  })

  test('hides remove button during processing', () => {
    expect(shouldShowRemoveButton(true, 'round-1', 'processing')).toBe(false)
  })

  test('hides remove button during closed', () => {
    expect(shouldShowRemoveButton(true, 'round-1', 'closed')).toBe(false)
  })

  test('hides remove button during revealed', () => {
    expect(shouldShowRemoveButton(true, 'round-1', 'revealed')).toBe(false)
  })

  test('hides remove button when not host', () => {
    expect(shouldShowRemoveButton(false, 'round-1', 'setup')).toBe(false)
  })

  test('hides remove button when isHost is undefined', () => {
    expect(shouldShowRemoveButton(undefined, 'round-1', 'setup')).toBe(false)
  })

  test('hides remove button when roundId is undefined', () => {
    expect(shouldShowRemoveButton(true, undefined, 'setup')).toBe(false)
  })

  test('hides remove button when roundStatus is undefined', () => {
    expect(shouldShowRemoveButton(true, 'round-1', undefined)).toBe(false)
  })
})

describe('lobby onPlayerRemoved callback logic', () => {
  test('removes the player from the list', () => {
    const players: Player[] = [
      { id: 'p-1', display_name: 'Alice' },
      { id: 'p-2', display_name: 'Bob' },
    ]
    const removed = makeParticipant({ id: 'p-1', removed: true })
    const result = applyRemoval(players, removed)

    expect(result).toEqual([{ id: 'p-2', display_name: 'Bob' }])
  })

  test('no-op when removing a player not in the list', () => {
    const players: Player[] = [
      { id: 'p-1', display_name: 'Alice' },
    ]
    const removed = makeParticipant({ id: 'p-999', removed: true })
    const result = applyRemoval(players, removed)

    expect(result).toEqual([{ id: 'p-1', display_name: 'Alice' }])
  })

  test('handles removing from an empty list', () => {
    const removed = makeParticipant({ id: 'p-1', removed: true })
    const result = applyRemoval([], removed)

    expect(result).toEqual([])
  })

  test('removes last player leaving empty list', () => {
    const players: Player[] = [{ id: 'p-1', display_name: 'Alice' }]
    const removed = makeParticipant({ id: 'p-1', removed: true })
    const result = applyRemoval(players, removed)

    expect(result).toEqual([])
  })
})
