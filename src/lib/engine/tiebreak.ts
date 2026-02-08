import { TieBreak } from './types'
import { createHash } from 'crypto'

/**
 * Break a tie among candidates who share the lowest vote count.
 * 3-tier strategy:
 *   1. Next-preference strength: among all ballots, who appears as 2nd/3rd/etc choice more?
 *   2. Total mentions: who appears on more ballots overall?
 *   3. Seeded SHA-256 coinflip: deterministic pseudo-random elimination
 */
export function breakTie(
  candidates: string[],
  allRankings: string[][],
  allOptions: string[],
  seed: string
): TieBreak {
  // Tier 1: next-preference strength
  // Count how many times each tied candidate appears as a non-first preference
  const nextPrefCounts: Record<string, number> = {}
  for (const c of candidates) {
    nextPrefCounts[c] = 0
  }
  for (const ranking of allRankings) {
    for (let i = 1; i < ranking.length; i++) {
      if (candidates.includes(ranking[i])) {
        nextPrefCounts[ranking[i]]++
      }
    }
  }

  const minNextPref = Math.min(...candidates.map(c => nextPrefCounts[c]))
  const tier1Losers = candidates.filter(c => nextPrefCounts[c] === minNextPref)

  if (tier1Losers.length === 1) {
    return {
      method: 'next-preference',
      candidates,
      eliminated: tier1Losers[0],
      detail: `Eliminated ${tier1Losers[0]} with fewest next-preference mentions (${minNextPref})`,
    }
  }

  // Tier 2: total mentions across all ballots
  const mentionCounts: Record<string, number> = {}
  for (const c of tier1Losers) {
    mentionCounts[c] = 0
  }
  for (const ranking of allRankings) {
    for (const c of tier1Losers) {
      if (ranking.includes(c)) {
        mentionCounts[c]++
      }
    }
  }

  const minMentions = Math.min(...tier1Losers.map(c => mentionCounts[c]))
  const tier2Losers = tier1Losers.filter(c => mentionCounts[c] === minMentions)

  if (tier2Losers.length === 1) {
    return {
      method: 'total-mentions',
      candidates: tier1Losers,
      eliminated: tier2Losers[0],
      detail: `Eliminated ${tier2Losers[0]} with fewest total mentions (${minMentions})`,
    }
  }

  // Tier 3: seeded SHA-256 coinflip
  const eliminated = seededElimination(tier2Losers, seed)
  return {
    method: 'coinflip',
    candidates: tier2Losers,
    eliminated,
    detail: `Tie broken by seeded coinflip — eliminated ${eliminated}`,
  }
}

function seededElimination(candidates: string[], seed: string): string {
  // Sort candidates deterministically, then hash each with the seed
  const sorted = [...candidates].sort()
  let selected = sorted[0]
  let lowestHash = ''

  for (const candidate of sorted) {
    const hash = createHash('sha256')
      .update(`${seed}:${candidate}`)
      .digest('hex')
    if (lowestHash === '' || hash < lowestHash) {
      lowestHash = hash
      selected = candidate
    }
  }

  return selected
}
