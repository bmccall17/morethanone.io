import { converge } from '@/lib/engine/converge'
import type { ConvergeResult, ConvergeRound, Transfer } from '@/lib/engine/types'
import type { DemoScenario } from './scenarios'

export class DemoRunner {
  readonly result: ConvergeResult
  readonly scenario: DemoScenario

  constructor(scenario: DemoScenario) {
    this.scenario = scenario
    this.result = converge({
      options: scenario.options,
      rankings: scenario.ballots,
      seed: 'demo',
    })
  }

  totalRounds(): number {
    return this.result.rounds.length
  }

  /** Returns round data up to and including round n (1-indexed). */
  getRound(n: number): ConvergeRound[] {
    return this.result.rounds.slice(0, n)
  }

  /** Returns plain-language explanation for round n (1-indexed). */
  getExplanation(n: number): string {
    if (n < 1 || n > this.result.rounds.length) return ''

    const round = this.result.rounds[n - 1]
    const totalVoters = this.scenario.ballots.length
    const isLastRound = n === this.result.rounds.length

    // Sort tallies descending for narrative
    const sorted = Object.entries(round.tallies).sort((a, b) => b[1] - a[1])
    const leader = sorted[0]
    const leaderPct = Math.round((leader[1] / round.active) * 100)

    // First round: describe initial state
    if (n === 1 && round.eliminated) {
      return buildEliminationExplanation(round, sorted, leader, leaderPct, totalVoters, true)
    }

    if (n === 1 && !round.eliminated) {
      // Single round, immediate winner
      return `${leader[0]} wins immediately with ${leader[1]} of ${round.active} votes (${leaderPct}%), surpassing the majority threshold of ${round.threshold}.`
    }

    // Final round with no elimination = winner declared
    if (isLastRound && !round.eliminated) {
      const winnerPct = Math.round((leader[1] / round.active) * 100)
      return `${leader[0]} reaches ${leader[1]} votes out of ${round.active} active ballots (${winnerPct}%), crossing the majority threshold of ${round.threshold}. ${leader[0]} is the final selection.`
    }

    // Mid-round with elimination
    if (round.eliminated) {
      return buildEliminationExplanation(round, sorted, leader, leaderPct, totalVoters, false)
    }

    return `Round ${n}: ${leader[0]} leads with ${leader[1]} votes.`
  }
}

function buildEliminationExplanation(
  round: ConvergeRound,
  sorted: [string, number][],
  leader: [string, number],
  leaderPct: number,
  totalVoters: number,
  isFirst: boolean,
): string {
  const parts: string[] = []
  const eliminated = round.eliminated!
  const elimVotes = round.tallies[eliminated]

  // Opening context
  if (isFirst) {
    parts.push(`${leader[0]} leads with ${leader[1]} first-choice votes out of ${totalVoters} ballots (${leaderPct}%), but hasn't reached the majority threshold of ${round.threshold}.`)
  } else {
    parts.push(`${leader[0]} holds the lead with ${leader[1]} votes (${leaderPct}% of ${round.active} active ballots), still short of the ${round.threshold} needed for a majority.`)
  }

  // Elimination
  parts.push(`${eliminated} has the fewest support with ${elimVotes} vote${elimVotes !== 1 ? 's' : ''} and is removed.`)

  // Transfers
  const realTransfers = round.transfers.filter(t => t.to !== null) as (Transfer & { to: string })[]
  const exhausted = round.transfers.find(t => t.to === null)

  if (realTransfers.length > 0) {
    const transferDescs = realTransfers
      .sort((a, b) => b.count - a.count)
      .map(t => `${t.count} to ${t.to}`)
    parts.push(`Those votes redistribute: ${transferDescs.join(', ')}.`)
  }

  if (exhausted && exhausted.count > 0) {
    parts.push(`${exhausted.count} ballot${exhausted.count !== 1 ? 's' : ''} had no remaining preferences and became inactive.`)
  }

  // Threshold note if it changed
  if (round.inactive > 0) {
    parts.push(`The majority threshold adjusts to ${round.threshold} based on ${round.active} active ballots.`)
  }

  return parts.join(' ')
}
