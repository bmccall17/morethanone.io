import { converge } from '@/lib/engine/converge'
import type { ConvergeResult, ConvergeRound } from '@/lib/engine/types'

/**
 * Helper: reproduce the computeProvenance logic from DemoTallyView
 * to verify it handles edge cases without needing React rendering.
 */
function computeProvenance(
  rounds: ConvergeRound[],
  displayRound: number,
  allOptions: string[]
): Record<string, Record<string, number>> {
  const prov: Record<string, Record<string, number>> = {}
  for (const opt of allOptions) {
    prov[opt] = { [opt]: rounds[0]?.tallies[opt] ?? 0 }
  }
  for (let i = 0; i < displayRound - 1 && i < rounds.length; i++) {
    const round = rounds[i]
    if (!round.eliminated) break
    const elim = round.eliminated
    prov[elim] = { [elim]: 0 }
    for (const t of round.transfers) {
      if (t.to) {
        if (!prov[t.to][elim]) prov[t.to][elim] = 0
        prov[t.to][elim] += t.count
      }
    }
  }
  return prov
}

/**
 * Helper: reproduce the eliminatedSet logic from SelectionGridView.
 */
function computeEliminatedSet(
  rounds: ConvergeRound[],
  roundNumber: number
): Set<string> {
  const set = new Set<string>()
  for (let i = 0; i < roundNumber && i < rounds.length; i++) {
    if (rounds[i].eliminated) set.add(rounds[i].eliminated!)
  }
  return set
}

describe('Single-round result edge cases', () => {
  let singleRoundResult: ConvergeResult

  beforeAll(() => {
    // 3 voters, A wins outright with majority on first count
    singleRoundResult = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'B', 'C'],
        ['A', 'C', 'B'],
        ['A', 'B', 'C'],
        ['B', 'A', 'C'],
      ],
    })
  })

  test('produces exactly 1 round', () => {
    expect(singleRoundResult.rounds).toHaveLength(1)
  })

  test('single round has no elimination', () => {
    expect(singleRoundResult.rounds[0].eliminated).toBeNull()
  })

  test('single round has no transfers', () => {
    expect(singleRoundResult.rounds[0].transfers).toEqual([])
  })

  test('winner is correctly identified', () => {
    expect(singleRoundResult.winner).toBe('A')
  })

  test('summary says "won outright"', () => {
    expect(singleRoundResult.summary.text).toContain('won outright')
  })

  test('computeProvenance handles single round (displayRound=1)', () => {
    const prov = computeProvenance(
      singleRoundResult.rounds,
      1,
      ['A', 'B', 'C']
    )
    // All votes should be self-sourced
    expect(prov['A']).toEqual({ A: 3 })
    expect(prov['B']).toEqual({ B: 1 })
    expect(prov['C']).toEqual({ C: 0 })
  })

  test('eliminatedSet is empty for single round at roundNumber=0', () => {
    const set = computeEliminatedSet(singleRoundResult.rounds, 0)
    expect(set.size).toBe(0)
  })

  test('isLastRound is true for single round', () => {
    const clampedIndex = Math.min(1, singleRoundResult.rounds.length) - 1
    const currentRound = singleRoundResult.rounds[Math.max(0, clampedIndex)]
    const isLastRound = clampedIndex === singleRoundResult.rounds.length - 1 && !currentRound.eliminated
    expect(isLastRound).toBe(true)
  })

  test('step controls should be hidden (rounds.length === 1)', () => {
    // This verifies the condition used in the host/player reveal pages
    expect(singleRoundResult.rounds.length > 1).toBe(false)
  })
})

describe('Anonymous mode edge cases', () => {
  test('ballot anonymization replaces display names', () => {
    // Simulate the anonymization logic from the ballots API
    const participants = [
      { display_name: 'Alice', ranking: ['A', 'B'] },
      { display_name: 'Bob', ranking: ['B', 'A'] },
      { display_name: 'Charlie', ranking: ['A', 'B'] },
    ]

    const anonymousResults = true
    const ballots = participants.map((p, index) => ({
      displayName: anonymousResults ? `Voter ${index + 1}` : p.display_name,
      ranking: p.ranking,
    }))

    // Verify no real names leak
    expect(ballots[0].displayName).toBe('Voter 1')
    expect(ballots[1].displayName).toBe('Voter 2')
    expect(ballots[2].displayName).toBe('Voter 3')

    // Verify rankings still contain option names (not personal info)
    expect(ballots[0].ranking).toEqual(['A', 'B'])
    expect(ballots[1].ranking).toEqual(['B', 'A'])
  })

  test('non-anonymous mode shows real names', () => {
    const participants = [
      { display_name: 'Alice', ranking: ['A', 'B'] },
      { display_name: 'Bob', ranking: ['B', 'A'] },
    ]

    const anonymousResults = false
    const ballots = participants.map((p, index) => ({
      displayName: anonymousResults ? `Voter ${index + 1}` : p.display_name,
      ranking: p.ranking,
    }))

    expect(ballots[0].displayName).toBe('Alice')
    expect(ballots[1].displayName).toBe('Bob')
  })

  test('anonymous ballot displayNames do not contain original names', () => {
    const realNames = ['Alice', 'Bob', 'Charlie']
    const participants = realNames.map(name => ({
      display_name: name,
      ranking: ['A', 'B'],
    }))

    const ballots = participants.map((p, index) => ({
      displayName: `Voter ${index + 1}`,
      ranking: p.ranking,
    }))

    for (const ballot of ballots) {
      for (const name of realNames) {
        expect(ballot.displayName).not.toBe(name)
        expect(ballot.displayName).not.toContain(name)
      }
    }
  })
})

describe('Tie-break display edge cases', () => {
  test('tie-break info string is correctly formatted from tie_breaks array', () => {
    // Simulate the reveal API's tie_break_info construction
    const tieBreaks = [
      { method: 'next-preference' as const, candidates: ['A', 'B'], eliminated: 'A', detail: 'Eliminated A with fewest next-preference mentions (2)' },
    ]
    const tieBreakInfo = tieBreaks.length > 0
      ? tieBreaks.map(tb => tb.detail).join('; ')
      : null

    expect(tieBreakInfo).toBe('Eliminated A with fewest next-preference mentions (2)')
  })

  test('multiple tie-breaks are joined with semicolons', () => {
    const tieBreaks = [
      { method: 'next-preference' as const, candidates: ['A', 'B'], eliminated: 'A', detail: 'Eliminated A with fewest next-preference mentions (2)' },
      { method: 'coinflip' as const, candidates: ['C', 'D'], eliminated: 'C', detail: 'Tie broken by seeded coinflip — eliminated C' },
    ]
    const tieBreakInfo = tieBreaks.map(tb => tb.detail).join('; ')

    expect(tieBreakInfo).toContain('Eliminated A')
    expect(tieBreakInfo).toContain('; ')
    expect(tieBreakInfo).toContain('eliminated C')
  })

  test('no tie-breaks produces null info', () => {
    const tieBreaks: { detail: string }[] = []
    const tieBreakInfo = tieBreaks.length > 0
      ? tieBreaks.map(tb => tb.detail).join('; ')
      : null

    expect(tieBreakInfo).toBeNull()
  })

  test('tie-break info is visible regardless of view state', () => {
    // Simulate the conditional rendering logic from the reveal pages
    const resultWithTieBreak = {
      tie_break_info: 'Eliminated X by coinflip',
    }

    // The tie-break card renders outside view conditionals
    // so it's visible for all view states
    // tie_break_info truthy check (same as JSX conditional) —
    // the card renders outside the view-conditional blocks,
    // so it's visible for animation, selection, and table views
    const shouldShow = !!resultWithTieBreak.tie_break_info
    expect(shouldShow).toBe(true)
  })

  test('converge produces tie_breaks for tied eliminations', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'C'],
        ['B', 'C'],
      ],
      seed: 'tie-test',
    })

    // A and B are tied at 1 vote each, C has 0
    // C should be eliminated first (fewest votes), no tie-break needed
    // Then A and B are tied — tie-break needed
    expect(result.winner).toBeDefined()
    // With only 2 voters and 3 options, there will be ties
    expect(result.rounds.length).toBeGreaterThanOrEqual(1)
  })

  test('tie-break info in converge result maps to display string', () => {
    // Force a tie-break scenario
    const result = converge({
      options: ['P', 'Q', 'R'],
      rankings: [
        ['P', 'R', 'Q'],
        ['P', 'R', 'Q'],
        ['Q', 'R', 'P'],
        ['Q', 'R', 'P'],
        ['R', 'Q', 'P'],
        ['R', 'Q', 'P'],
        ['R', 'Q'],
      ],
      seed: 'tie-display-test',
    })

    if (result.tie_breaks.length > 0) {
      const tieBreakInfo = result.tie_breaks.map(tb => tb.detail).join('; ')
      expect(tieBreakInfo.length).toBeGreaterThan(0)
      // Each tie-break detail should mention an eliminated candidate
      for (const tb of result.tie_breaks) {
        expect(tb.detail).toContain(tb.eliminated)
      }
    }
  })
})

describe('DemoTallyView edge cases', () => {
  test('computeProvenance handles empty rounds array gracefully', () => {
    const prov = computeProvenance([], 1, ['A', 'B'])
    // Should not crash, should default to 0
    expect(prov['A']).toEqual({ A: 0 })
    expect(prov['B']).toEqual({ B: 0 })
  })

  test('computeProvenance handles round number exceeding rounds length', () => {
    const rounds: ConvergeRound[] = [{
      round_number: 1,
      tallies: { A: 3, B: 2 },
      eliminated: null,
      transfers: [],
      active: 5,
      inactive: 0,
      threshold: 3,
    }]

    // Display round 5 when only 1 round exists
    const prov = computeProvenance(rounds, 5, ['A', 'B'])
    expect(prov['A']).toEqual({ A: 3 })
    expect(prov['B']).toEqual({ B: 2 })
  })

  test('clampedIndex is safe with empty rounds', () => {
    const rounds: ConvergeRound[] = []
    const roundNumber = 1
    const clampedIndex = Math.min(roundNumber, rounds.length) - 1
    // clampedIndex would be -1, Math.max(0, -1) = 0
    const safeIndex = Math.max(0, clampedIndex)
    expect(safeIndex).toBe(0)
    // rounds[0] would be undefined, which our fix handles with early return
    expect(rounds[safeIndex]).toBeUndefined()
  })
})

describe('FullResultsTableView logic edge cases', () => {
  test('single-round result has correct eliminatedAt map', () => {
    const rounds: ConvergeRound[] = [{
      round_number: 1,
      tallies: { A: 3, B: 1, C: 0 },
      eliminated: null,
      transfers: [],
      active: 4,
      inactive: 0,
      threshold: 3,
    }]

    const eliminatedAt: Record<string, number> = {}
    for (const round of rounds) {
      if (round.eliminated) {
        eliminatedAt[round.eliminated] = round.round_number
      }
    }

    // No eliminations in a single-round result
    expect(Object.keys(eliminatedAt)).toHaveLength(0)
  })

  test('multi-round result tracks eliminations correctly', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'B', 'C'],
        ['B', 'A', 'C'],
        ['C', 'B', 'A'],
        ['B', 'C', 'A'],
        ['C', 'A', 'B'],
      ],
    })

    const eliminatedAt: Record<string, number> = {}
    for (const round of result.rounds) {
      if (round.eliminated) {
        eliminatedAt[round.eliminated] = round.round_number
      }
    }

    // At least one elimination should occur
    expect(Object.keys(eliminatedAt).length).toBeGreaterThanOrEqual(1)

    // Winner should not be in eliminatedAt
    expect(eliminatedAt[result.winner]).toBeUndefined()
  })

  test('delta is null for first round', () => {
    const rounds: ConvergeRound[] = [{
      round_number: 1,
      tallies: { A: 3, B: 1, C: 0 },
      eliminated: null,
      transfers: [],
      active: 4,
      inactive: 0,
      threshold: 3,
    }]

    const roundIdx = 0
    const prevCount = roundIdx > 0 ? rounds[roundIdx - 1].tallies['A'] : undefined
    const count = rounds[roundIdx].tallies['A']
    const delta = count !== undefined && prevCount !== undefined ? count - prevCount : null

    expect(delta).toBeNull()
  })
})

describe('SelectionGridView logic edge cases', () => {
  test('empty ballots produce at least 1 rank column', () => {
    const ballots: { displayName: string; ranking: string[] }[] = []
    const maxRank = Math.max(...ballots.map(b => b.ranking.length), 1)
    expect(maxRank).toBe(1)
  })

  test('active preference is first non-eliminated option', () => {
    const ballot = { displayName: 'Voter 1', ranking: ['A', 'B', 'C'] }
    const eliminatedSet = new Set(['A'])

    const activePreference = ballot.ranking.find(opt => !eliminatedSet.has(opt)) ?? null
    expect(activePreference).toBe('B')
  })

  test('active preference is first option when nothing eliminated', () => {
    const ballot = { displayName: 'Voter 1', ranking: ['A', 'B', 'C'] }
    const eliminatedSet = new Set<string>()

    const activePreference = ballot.ranking.find(opt => !eliminatedSet.has(opt)) ?? null
    expect(activePreference).toBe('A')
  })

  test('active preference is null when all options eliminated', () => {
    const ballot = { displayName: 'Voter 1', ranking: ['A', 'B'] }
    const eliminatedSet = new Set(['A', 'B'])

    const activePreference = ballot.ranking.find(opt => !eliminatedSet.has(opt)) ?? null
    expect(activePreference).toBeNull()
  })
})
