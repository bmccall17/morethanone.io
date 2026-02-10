import type { ConvergeResult } from '@/lib/engine/types'
import type { Transfer } from '@/lib/engine/types'

/**
 * Returns a plain-language explanation for a given round number (1-indexed).
 * Extracted from DemoRunner.getExplanation() for shared use.
 */
export function getExplanationForRound(result: ConvergeResult, roundNumber: number): string {
  if (roundNumber < 1 || roundNumber > result.rounds.length) return ''

  const round = result.rounds[roundNumber - 1]
  const isLastRound = roundNumber === result.rounds.length

  // Sort tallies descending for narrative
  const sorted = Object.entries(round.tallies).sort((a, b) => b[1] - a[1])
  const leader = sorted[0]
  const leaderPct = Math.round((leader[1] / round.active) * 100)

  // First round: describe initial state
  if (roundNumber === 1 && round.eliminated) {
    return buildEliminationExplanation(round.tallies, round, sorted, leader, leaderPct, round.active, true)
  }

  if (roundNumber === 1 && !round.eliminated) {
    return `${leader[0]} wins immediately with ${leader[1]} of ${round.active} votes (${leaderPct}%), surpassing the majority threshold of ${round.threshold}.`
  }

  // Final round with no elimination = winner declared
  if (isLastRound && !round.eliminated) {
    const winnerPct = Math.round((leader[1] / round.active) * 100)
    return `${leader[0]} reaches ${leader[1]} votes out of ${round.active} active ballots (${winnerPct}%), crossing the majority threshold of ${round.threshold}. ${leader[0]} is the final selection.`
  }

  // Mid-round with elimination
  if (round.eliminated) {
    return buildEliminationExplanation(round.tallies, round, sorted, leader, leaderPct, round.active, false)
  }

  return `Round ${roundNumber}: ${leader[0]} leads with ${leader[1]} votes.`
}

interface RoundLike {
  eliminated: string | null
  tallies: Record<string, number>
  transfers: { from: string; to: string | null; count: number }[]
  active: number
  inactive: number
  threshold: number
}

function buildEliminationExplanation(
  _tallies: Record<string, number>,
  round: RoundLike,
  sorted: [string, number][],
  leader: [string, number],
  leaderPct: number,
  totalActive: number,
  isFirst: boolean,
): string {
  const parts: string[] = []
  const eliminated = round.eliminated!
  const elimVotes = round.tallies[eliminated]

  if (isFirst) {
    parts.push(`${leader[0]} leads with ${leader[1]} first-choice votes out of ${totalActive} ballots (${leaderPct}%), but hasn't reached the majority threshold of ${round.threshold}.`)
  } else {
    parts.push(`${leader[0]} holds the lead with ${leader[1]} votes (${leaderPct}% of ${round.active} active ballots), still short of the ${round.threshold} needed for a majority.`)
  }

  parts.push(`${eliminated} has the fewest support with ${elimVotes} vote${elimVotes !== 1 ? 's' : ''} and is removed.`)

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

  if (round.inactive > 0) {
    parts.push(`The majority threshold adjusts to ${round.threshold} based on ${round.active} active ballots.`)
  }

  return parts.join(' ')
}
