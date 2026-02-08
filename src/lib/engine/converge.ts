import { ConvergeInput, ConvergeResult, ConvergeRound, Transfer } from './types'
import { breakTie } from './tiebreak'
import { generateSummary } from './summarize'

/**
 * Run instant-runoff / ranked-choice convergence algorithm.
 *
 * 1. Count each ballot's top remaining choice
 * 2. If any option has > 50% of active ballots, it wins
 * 3. Otherwise, eliminate the option with fewest votes (tie-break if needed)
 * 4. Redistribute eliminated option's votes to next preferences
 * 5. Repeat until a winner is found or only one option remains
 */
export function converge(input: ConvergeInput): ConvergeResult {
  const { options, rankings, seed = 'default-seed' } = input

  if (options.length === 0) {
    throw new Error('No options provided')
  }
  if (rankings.length === 0) {
    throw new Error('No rankings provided')
  }

  let activeOptions = new Set(options)
  // Working copy of ballots — we filter out eliminated options as we go
  let ballots = rankings.map(r => [...r])
  const rounds: ConvergeRound[] = []
  const tieBreaks: ConvergeResult['tie_breaks'] = []
  const totalActive = rankings.length
  const majorityThreshold = Math.floor(totalActive / 2) + 1

  while (activeOptions.size > 1) {
    // Remove eliminated options from all ballots
    ballots = ballots.map(b => b.filter(opt => activeOptions.has(opt)))

    // Count top choices
    const tallies: Record<string, number> = {}
    for (const opt of activeOptions) {
      tallies[opt] = 0
    }
    for (const ballot of ballots) {
      if (ballot.length > 0) {
        tallies[ballot[0]]++
      }
    }

    // Check for majority winner
    const topOption = Object.entries(tallies).sort((a, b) => b[1] - a[1])[0]
    if (topOption && topOption[1] >= majorityThreshold) {
      rounds.push({
        round_number: rounds.length + 1,
        tallies: { ...tallies },
        eliminated: null,
        transfers: [],
      })
      break
    }

    // Find the option(s) with the fewest votes
    const minVotes = Math.min(...Object.values(tallies))
    const lowestOptions = Object.keys(tallies).filter(k => tallies[k] === minVotes)

    let eliminated: string
    if (lowestOptions.length === 1) {
      eliminated = lowestOptions[0]
    } else {
      const tb = breakTie(lowestOptions, rankings, options, `${seed}:round${rounds.length + 1}`)
      tieBreaks.push(tb)
      eliminated = tb.eliminated
    }

    // Calculate transfers
    const transfers: Transfer[] = []
    const transferCounts: Record<string, number> = {}
    let exhaustedCount = 0

    for (const ballot of ballots) {
      if (ballot.length > 0 && ballot[0] === eliminated) {
        // Find next active preference (excluding the one being eliminated)
        const nextPref = ballot.slice(1).find(opt => activeOptions.has(opt) && opt !== eliminated)
        if (nextPref) {
          transferCounts[nextPref] = (transferCounts[nextPref] || 0) + 1
        } else {
          exhaustedCount++
        }
      }
    }

    for (const [to, count] of Object.entries(transferCounts)) {
      transfers.push({ from: eliminated, to, count })
    }
    if (exhaustedCount > 0) {
      transfers.push({ from: eliminated, to: null, count: exhaustedCount })
    }

    rounds.push({
      round_number: rounds.length + 1,
      tallies: { ...tallies },
      eliminated,
      transfers,
    })

    activeOptions.delete(eliminated)

    // If only one option left, it wins by default
    if (activeOptions.size === 1) {
      // Add final round showing the last standing option
      ballots = ballots.map(b => b.filter(opt => activeOptions.has(opt)))
      const finalTallies: Record<string, number> = {}
      const lastOption = [...activeOptions][0]
      finalTallies[lastOption] = ballots.filter(b => b.length > 0 && b[0] === lastOption).length
      rounds.push({
        round_number: rounds.length + 1,
        tallies: finalTallies,
        eliminated: null,
        transfers: [],
      })
      break
    }
  }

  // If only one option was provided, it wins immediately
  if (options.length === 1) {
    rounds.push({
      round_number: 1,
      tallies: { [options[0]]: rankings.length },
      eliminated: null,
      transfers: [],
    })
  }

  // Determine winner from the last round's tallies
  const lastRound = rounds[rounds.length - 1]
  const winner = Object.entries(lastRound.tallies).sort((a, b) => b[1] - a[1])[0][0]
  const winnerVotes = lastRound.tallies[winner]
  const winningPercentage = totalActive > 0 ? Math.round((winnerVotes / totalActive) * 100) : 100

  // Determine runner-up from the last round with an elimination, or from final tallies
  let runnerUp: string | null = null
  const finalTallySorted = Object.entries(lastRound.tallies).sort((a, b) => b[1] - a[1])
  if (finalTallySorted.length > 1) {
    runnerUp = finalTallySorted[1][0]
  } else {
    // Look at the last eliminated option
    for (let i = rounds.length - 1; i >= 0; i--) {
      if (rounds[i].eliminated) {
        runnerUp = rounds[i].eliminated
        break
      }
    }
  }

  const summary = generateSummary({
    winner,
    runnerUp,
    totalRounds: rounds.length,
    totalActive,
    winningPercentage,
    tieBreaks,
  })

  return {
    winner,
    rounds,
    majority_threshold: majorityThreshold,
    total_active: totalActive,
    tie_breaks: tieBreaks,
    summary: {
      text: summary,
      total_rounds: rounds.length,
      winner,
      runner_up: runnerUp,
      winning_percentage: winningPercentage,
    },
  }
}
