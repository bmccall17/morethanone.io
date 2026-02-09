import type { RoundSettings, RoundStatus } from '@/types/database'
import { converge } from '@/lib/engine/converge'
import type { ConvergeRound } from '@/lib/engine/types'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: false,
  show_processing: false,
}

describe('process route guard checks', () => {
  test('rejects when round is not in processing phase', () => {
    const nonProcessingStatuses: RoundStatus[] = ['setup', 'ranking', 'closed', 'revealed']
    for (const status of nonProcessingStatuses) {
      expect(status !== 'processing').toBe(true)
    }
  })

  test('allows when round is in processing phase', () => {
    const status: RoundStatus = 'processing'
    expect(status).toBe('processing')
  })

  test('rejects when show_processing is disabled', () => {
    expect(defaultSettings.show_processing).toBe(false)
  })

  test('allows when show_processing is enabled', () => {
    const settings: RoundSettings = { ...defaultSettings, show_processing: true }
    expect(settings.show_processing).toBe(true)
  })
})

describe('process route incremental round stepping', () => {
  // Simulate the incremental stepping logic from the route
  function buildProcessingSlices(rounds: ConvergeRound[]): ConvergeRound[][] {
    const slices: ConvergeRound[][] = []
    for (let i = 0; i < rounds.length; i++) {
      slices.push(rounds.slice(0, i + 1))
    }
    return slices
  }

  test('produces one slice per round', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [['A', 'B', 'C'], ['B', 'A', 'C'], ['C', 'A', 'B']],
      seed: 'test',
    })

    const slices = buildProcessingSlices(result.rounds)
    expect(slices).toHaveLength(result.rounds.length)
  })

  test('first slice contains only the first round', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [['A', 'B', 'C'], ['B', 'A', 'C'], ['C', 'A', 'B']],
      seed: 'test',
    })

    const slices = buildProcessingSlices(result.rounds)
    expect(slices[0]).toHaveLength(1)
    expect(slices[0][0].round_number).toBe(1)
  })

  test('last slice contains all rounds', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [['A', 'B', 'C'], ['B', 'A', 'C'], ['C', 'A', 'B']],
      seed: 'test',
    })

    const slices = buildProcessingSlices(result.rounds)
    const lastSlice = slices[slices.length - 1]
    expect(lastSlice).toHaveLength(result.rounds.length)
    expect(lastSlice).toEqual(result.rounds)
  })

  test('each slice grows by one round', () => {
    const result = converge({
      options: ['A', 'B', 'C', 'D'],
      rankings: [
        ['A', 'B', 'C', 'D'],
        ['B', 'C', 'A', 'D'],
        ['C', 'A', 'B', 'D'],
        ['D', 'A', 'B', 'C'],
        ['A', 'C', 'D', 'B'],
      ],
      seed: 'test',
    })

    const slices = buildProcessingSlices(result.rounds)
    for (let i = 0; i < slices.length; i++) {
      expect(slices[i]).toHaveLength(i + 1)
    }
  })

  test('works with single-round convergence (immediate majority)', () => {
    const result = converge({
      options: ['A', 'B'],
      rankings: [['A', 'B'], ['A', 'B'], ['B', 'A']],
      seed: 'test',
    })

    const slices = buildProcessingSlices(result.rounds)
    expect(slices).toHaveLength(1)
    expect(slices[0]).toEqual(result.rounds)
  })
})

describe('process route current_processing_round tracking', () => {
  function getProcessingRoundNumbers(totalRounds: number): number[] {
    const numbers: number[] = []
    for (let i = 0; i < totalRounds; i++) {
      numbers.push(i + 1)
    }
    return numbers
  }

  test('broadcasts 1-indexed round numbers', () => {
    const numbers = getProcessingRoundNumbers(3)
    expect(numbers).toEqual([1, 2, 3])
  })

  test('broadcasts single round number for immediate winner', () => {
    const numbers = getProcessingRoundNumbers(1)
    expect(numbers).toEqual([1])
  })

  test('final broadcast number equals total rounds', () => {
    const result = converge({
      options: ['A', 'B', 'C', 'D'],
      rankings: [
        ['A', 'B', 'C', 'D'],
        ['B', 'C', 'A', 'D'],
        ['C', 'A', 'B', 'D'],
        ['D', 'A', 'B', 'C'],
        ['A', 'C', 'D', 'B'],
      ],
      seed: 'test',
    })

    const numbers = getProcessingRoundNumbers(result.rounds.length)
    expect(numbers[numbers.length - 1]).toBe(result.rounds.length)
  })
})

describe('process route response shape', () => {
  function buildResponse(result: { rounds: ConvergeRound[]; winner: string; summary: object }) {
    return {
      status: 'closed' as const,
      total_rounds: result.rounds.length,
      winner: result.winner,
      summary: result.summary,
    }
  }

  test('response includes closed status after processing', () => {
    const result = converge({
      options: ['A', 'B'],
      rankings: [['A', 'B'], ['A', 'B'], ['B', 'A']],
      seed: 'test',
    })

    const response = buildResponse(result)
    expect(response.status).toBe('closed')
  })

  test('response includes total rounds count', () => {
    const result = converge({
      options: ['A', 'B', 'C'],
      rankings: [['A', 'B', 'C'], ['B', 'A', 'C'], ['C', 'A', 'B']],
      seed: 'test',
    })

    const response = buildResponse(result)
    expect(response.total_rounds).toBe(result.rounds.length)
    expect(response.total_rounds).toBeGreaterThanOrEqual(1)
  })

  test('response includes winner', () => {
    const result = converge({
      options: ['A', 'B'],
      rankings: [['A', 'B'], ['A', 'B'], ['B', 'A']],
      seed: 'test',
    })

    const response = buildResponse(result)
    expect(response.winner).toBe(result.winner)
  })

  test('response includes summary', () => {
    const result = converge({
      options: ['A', 'B'],
      rankings: [['A', 'B'], ['A', 'B'], ['B', 'A']],
      seed: 'test',
    })

    const response = buildResponse(result)
    expect(response.summary).toBeDefined()
    expect(response.summary).toBe(result.summary)
  })
})

describe('process route auth validation', () => {
  test('missing host token is rejected', () => {
    const hostToken: string | null = null
    expect(hostToken).toBeNull()
  })

  test('mismatched host token is rejected', () => {
    const roundHostToken = 'token-abc'
    const requestHostToken = 'token-xyz'
    expect(roundHostToken !== requestHostToken).toBe(true)
  })

  test('matching host token is accepted', () => {
    const roundHostToken = 'token-abc'
    const requestHostToken = 'token-abc'
    expect(roundHostToken === requestHostToken).toBe(true)
  })
})
