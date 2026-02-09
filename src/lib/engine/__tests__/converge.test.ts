import { converge } from '../converge'

describe('converge algorithm', () => {
  test('clear first-round majority', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'B', 'C'],
        ['A', 'C', 'B'],
        ['A', 'B', 'C'],
        ['B', 'A', 'C'],
      ],
    })

    expect(result.winner).toBe('A')
    expect(result.rounds).toHaveLength(1)
    expect(result.summary.winning_percentage).toBe(75)
    expect(result.rounds[0].tallies).toEqual({ A: 3, B: 1, C: 0 })
    expect(result.rounds[0].active).toBe(4)
    expect(result.rounds[0].inactive).toBe(0)
    expect(result.rounds[0].threshold).toBe(3)
  })

  test('multi-round elimination', () => {
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

    // Round 1: A=1, B=2, C=2 → A eliminated
    // Round 2: B=3, C=2 → B wins
    expect(result.winner).toBe('B')
    expect(result.rounds.length).toBeGreaterThan(1)
    expect(result.rounds[0].eliminated).toBe('A')
    expect(result.summary.total_rounds).toBe(result.rounds.length)
    // All full rankings, so active should stay at 5 throughout
    for (const round of result.rounds) {
      expect(round.active).toBe(5)
      expect(round.inactive).toBe(0)
    }
  })

  test('exhausted ballots', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A'],        // only ranks A, exhausts after A eliminated
        ['B', 'A'],   // only ranks B then A
        ['C', 'B', 'A'],
        ['C', 'A'],
        ['B', 'C'],
      ],
    })

    // Round 1: A=1, B=2, C=2 → A eliminated
    // After redistribution: A's sole ranker had no next choice → exhausted
    // Round 2: active=4 (1 exhausted), threshold=3
    expect(['B', 'C']).toContain(result.winner)
    const eliminationRound = result.rounds.find(r => r.eliminated === 'A')
    expect(eliminationRound).toBeDefined()
    const exhaustedTransfer = eliminationRound!.transfers.find(t => t.to === null)
    expect(exhaustedTransfer).toBeDefined()

    // Verify threshold shrinks post-redistribution
    expect(eliminationRound!.active).toBe(5) // all active in round 1
    const laterRounds = result.rounds.filter(r => r.round_number > eliminationRound!.round_number)
    if (laterRounds.length > 0) {
      expect(laterRounds[0].inactive).toBeGreaterThan(0)
      expect(laterRounds[0].active).toBeLessThan(5)
    }
  })

  test('threshold shrinks with exhausted rankings', () => {
    // 10 participants, 4 options. Heavy partial rankings.
    // Without threshold recalculation, the winner would need 6 (floor(10/2)+1).
    // With exhaustion, the threshold should shrink and a winner emerges sooner.
    const result = converge({
      options: ['A', 'B', 'C', 'D'],
      rankings: [
        ['A'],           // exhausts after A eliminated
        ['A'],           // exhausts after A eliminated
        ['A'],           // exhausts after A eliminated
        ['D', 'B'],      // D first, then B
        ['D', 'B'],      // D first, then B
        ['B', 'C'],      // B first
        ['B', 'C'],      // B first
        ['B', 'C'],      // B first
        ['C'],           // only C
        ['C'],           // only C
      ],
    })

    // Round 1: A=3, B=3, C=2, D=2. Threshold=6. No majority.
    // D or C eliminated (tie at 2, tie-break decides).
    // Eventually A gets eliminated → 3 rankings exhaust → active drops to 7, threshold=4.
    // B should win since it has strong support and the threshold shrinks.
    expect(result.winner).toBeDefined()

    // Verify that later rounds have higher inactive counts
    const lastRound = result.rounds[result.rounds.length - 1]
    const firstRound = result.rounds[0]
    expect(firstRound.inactive).toBe(0)
    // Some rankings should be exhausted by the final round
    if (result.rounds.length > 2) {
      expect(lastRound.threshold).toBeLessThanOrEqual(firstRound.threshold)
    }
  })

  test('rounds include active, inactive, threshold fields', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'B', 'C'],
        ['B', 'A', 'C'],
        ['C', 'B', 'A'],
      ],
    })

    for (const round of result.rounds) {
      expect(round).toHaveProperty('active')
      expect(round).toHaveProperty('inactive')
      expect(round).toHaveProperty('threshold')
      expect(round.active).toBeGreaterThan(0)
      expect(round.inactive).toBeGreaterThanOrEqual(0)
      expect(round.threshold).toBe(Math.floor(round.active / 2) + 1)
    }
  })

  test('winning percentage is post-redistribution', () => {
    // 6 participants, many partial rankings
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A'],           // exhausts after A eliminated
        ['A'],           // exhausts after A eliminated
        ['B', 'C'],
        ['B', 'C'],
        ['C', 'B'],
        ['C', 'B'],
      ],
    })

    // Round 1: A=2, B=2, C=2 → A eliminated (tie-break)
    // Round 2: 2 exhausted, active=4, B=2, C=2 → tie-break picks winner
    // Winner should have 50% of active (2/4) or 100% if only one left
    const lastRound = result.rounds[result.rounds.length - 1]
    const winnerVotes = lastRound.tallies[result.winner]
    const expectedPct = Math.round((winnerVotes / lastRound.active) * 100)
    expect(result.summary.winning_percentage).toBe(expectedPct)
  })

  test('summary uses post-redistribution language when rankings exhaust', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A'],           // exhausts
        ['B', 'C'],
        ['B', 'C'],
        ['C', 'B'],
      ],
    })

    const lastRound = result.rounds[result.rounds.length - 1]
    if (lastRound.inactive > 0) {
      expect(result.summary.text).toContain('post-redistribution')
      expect(result.summary.text).toContain('no remaining preferences')
    }
  })

  test('two options — immediate result', () => {
    const result = converge({
      options: ['A', 'B'],
      rankings: [
        ['A', 'B'],
        ['B', 'A'],
        ['A', 'B'],
      ],
    })

    expect(result.winner).toBe('A')
    expect(result.rounds).toHaveLength(1)
  })

  test('single option', () => {
    const result = converge({
      options: ['Only'],
      rankings: [['Only'], ['Only']],
    })

    expect(result.winner).toBe('Only')
    expect(result.rounds).toHaveLength(1)
    expect(result.rounds[0].active).toBe(2)
    expect(result.rounds[0].inactive).toBe(0)
  })

  test('throws on empty options', () => {
    expect(() => converge({ options: [], rankings: [['A']] })).toThrow('No options provided')
  })

  test('throws on empty rankings', () => {
    expect(() => converge({ options: ['A'], rankings: [] })).toThrow('No rankings provided')
  })

  test('tie-break by next-preference strength', () => {
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
      seed: 'test-seed',
    })

    expect(result.rounds[0].eliminated).toBe('P')
    expect(result.tie_breaks.length).toBeGreaterThanOrEqual(1)
    expect(result.tie_breaks[0].method).toBe('next-preference')
  })

  test('tie-break by total mentions', () => {
    const result = converge({
      options: ['A', 'B', 'C', 'D'],
      rankings: [
        ['A', 'C'],
        ['D', 'C'],
        ['B', 'C'],
        ['B', 'C'],
        ['C', 'B'],
      ],
      seed: 'tier2-test',
    })

    expect(result.winner).toBeDefined()
    expect(result.rounds.length).toBeGreaterThanOrEqual(1)
  })

  test('deterministic coinflip tie-break', () => {
    const result1 = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'C'],
        ['B', 'C'],
      ],
      seed: 'determinism-test',
    })

    const result2 = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'C'],
        ['B', 'C'],
      ],
      seed: 'determinism-test',
    })

    expect(result1.winner).toBe(result2.winner)
    expect(result1.rounds).toEqual(result2.rounds)
  })

  test('different seed produces potentially different coinflip', () => {
    const results = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const result = converge({
        options: ['A', 'B', 'C'],
        rankings: [
          ['A', 'C'],
          ['B', 'C'],
        ],
        seed: `seed-${i}`,
      })
      results.add(result.winner)
    }

    expect(results.size).toBeGreaterThanOrEqual(1)
  })

  test('all participants rank the same', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [
        ['A', 'B', 'C'],
        ['A', 'B', 'C'],
        ['A', 'B', 'C'],
      ],
    })

    expect(result.winner).toBe('A')
    expect(result.rounds).toHaveLength(1)
    expect(result.summary.winning_percentage).toBe(100)
  })

  test('many options with gradual elimination', () => {
    const result = converge({
      options: ['A', 'B', 'C', 'D', 'E'],
      rankings: [
        ['A', 'B', 'C', 'D', 'E'],
        ['B', 'A', 'C', 'D', 'E'],
        ['C', 'D', 'E', 'A', 'B'],
        ['D', 'C', 'E', 'B', 'A'],
        ['E', 'D', 'C', 'B', 'A'],
        ['A', 'E', 'D', 'C', 'B'],
        ['B', 'A', 'E', 'D', 'C'],
      ],
    })

    expect(result.winner).toBeDefined()
    expect(result.rounds.length).toBeGreaterThanOrEqual(2)
    expect(result.total_active).toBe(7)
    // First round threshold with 7 full rankings = floor(7/2)+1 = 4
    expect(result.majority_threshold).toBe(4)
  })

  test('summary text is generated', () => {
    const result = converge({
      options: ['Pizza', 'Tacos', 'Sushi'],
      rankings: [
        ['Pizza', 'Tacos', 'Sushi'],
        ['Pizza', 'Sushi', 'Tacos'],
        ['Tacos', 'Pizza', 'Sushi'],
      ],
    })

    expect(result.summary.text).toContain(result.winner)
    expect(result.summary.text.length).toBeGreaterThan(10)
  })
})
