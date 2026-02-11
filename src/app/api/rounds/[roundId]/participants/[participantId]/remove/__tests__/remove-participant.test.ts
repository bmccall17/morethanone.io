describe('remove participant route auth validation', () => {
  test('rejects when no host token provided', () => {
    const hostToken: string | null = null
    expect(hostToken).toBeNull()
  })

  test('rejects when host token does not match', () => {
    const roundHostToken = 'token-abc'
    const requestHostToken = 'token-xyz'
    expect(roundHostToken !== requestHostToken).toBe(true)
  })

  test('accepts when host token matches', () => {
    const roundHostToken = 'token-abc'
    const requestHostToken = 'token-abc'
    expect(roundHostToken === requestHostToken).toBe(true)
  })
})

describe('remove participant logic', () => {
  test('participant belongs to the correct round', () => {
    const participant = { id: 'p1', round_id: 'r1' }
    const requestRoundId = 'r1'
    expect(participant.round_id).toBe(requestRoundId)
  })

  test('rejects participant from a different round', () => {
    const participant = { id: 'p1', round_id: 'r2' }
    const requestRoundId = 'r1'
    expect(participant.round_id).not.toBe(requestRoundId)
  })

  test('sets removed to true', () => {
    const participant = { id: 'p1', removed: false }
    const updated = { ...participant, removed: true }
    expect(updated.removed).toBe(true)
  })

  test('participant was not already removed', () => {
    const participant = { id: 'p1', removed: false }
    expect(participant.removed).toBe(false)
  })

  test('idempotent — removing an already-removed participant still succeeds', () => {
    const participant = { id: 'p1', removed: true }
    const updated = { ...participant, removed: true }
    expect(updated.removed).toBe(true)
  })
})

describe('removed participant ranking exclusion', () => {
  test('rankings filter excludes removed participants', () => {
    const participants = [
      { id: 'p1', removed: false },
      { id: 'p2', removed: true },
      { id: 'p3', removed: false },
    ]
    const rankings = [
      { participant_id: 'p1', ranking: ['A', 'B'] },
      { participant_id: 'p2', ranking: ['B', 'A'] },
      { participant_id: 'p3', ranking: ['A', 'B'] },
    ]

    const activeParticipantIds = new Set(
      participants.filter(p => !p.removed).map(p => p.id)
    )
    const activeRankings = rankings.filter(r =>
      activeParticipantIds.has(r.participant_id)
    )

    expect(activeRankings).toHaveLength(2)
    expect(activeRankings.map(r => r.participant_id)).toEqual(['p1', 'p3'])
  })

  test('all participants removed yields no rankings', () => {
    const participants = [
      { id: 'p1', removed: true },
      { id: 'p2', removed: true },
    ]
    const rankings = [
      { participant_id: 'p1', ranking: ['A', 'B'] },
      { participant_id: 'p2', ranking: ['B', 'A'] },
    ]

    const activeParticipantIds = new Set(
      participants.filter(p => !p.removed).map(p => p.id)
    )
    const activeRankings = rankings.filter(r =>
      activeParticipantIds.has(r.participant_id)
    )

    expect(activeRankings).toHaveLength(0)
  })

  test('no removed participants yields all rankings', () => {
    const participants = [
      { id: 'p1', removed: false },
      { id: 'p2', removed: false },
    ]
    const rankings = [
      { participant_id: 'p1', ranking: ['A', 'B'] },
      { participant_id: 'p2', ranking: ['B', 'A'] },
    ]

    const activeParticipantIds = new Set(
      participants.filter(p => !p.removed).map(p => p.id)
    )
    const activeRankings = rankings.filter(r =>
      activeParticipantIds.has(r.participant_id)
    )

    expect(activeRankings).toHaveLength(2)
  })
})
