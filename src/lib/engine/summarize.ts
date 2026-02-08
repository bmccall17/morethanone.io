import { TieBreak } from './types'

interface SummaryInput {
  winner: string
  runnerUp: string | null
  totalRounds: number
  totalActive: number
  winningPercentage: number
  tieBreaks: TieBreak[]
}

export function generateSummary(input: SummaryInput): string {
  const { winner, runnerUp, totalRounds, totalActive, winningPercentage, tieBreaks } = input

  const parts: string[] = []

  // Opening sentence
  if (totalRounds === 1) {
    parts.push(
      `${winner} won outright in the first round with ${winningPercentage}% support from ${totalActive} participant${totalActive === 1 ? '' : 's'}.`
    )
  } else {
    parts.push(
      `After ${totalRounds} round${totalRounds === 1 ? '' : 's'} of elimination, ${winner} emerged as the group's choice with ${winningPercentage}% support.`
    )
  }

  // Runner-up context
  if (runnerUp) {
    if (totalRounds > 1) {
      parts.push(`${runnerUp} was the last to be eliminated.`)
    } else {
      parts.push(`${runnerUp} came in second.`)
    }
  }

  // Tie-break note
  if (tieBreaks.length > 0) {
    const coinflips = tieBreaks.filter(tb => tb.method === 'coinflip')
    if (coinflips.length > 0) {
      parts.push(`A coinflip was needed to break ${coinflips.length} tie${coinflips.length > 1 ? 's' : ''}.`)
    }
  }

  return parts.join(' ')
}
