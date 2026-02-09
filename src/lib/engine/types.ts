export interface ConvergeInput {
  options: string[]
  rankings: string[][] // each inner array is one participant's ranked preferences
  seed?: string // for deterministic tie-breaking
}

export interface Transfer {
  from: string
  to: string | null // null = exhausted
  count: number
}

export interface ConvergeRound {
  round_number: number
  tallies: Record<string, number>
  eliminated: string | null
  transfers: Transfer[]
  active: number
  inactive: number
  threshold: number
}

export interface TieBreak {
  method: 'next-preference' | 'total-mentions' | 'coinflip'
  candidates: string[]
  eliminated: string
  detail: string
}

export interface ConvergeResult {
  winner: string
  rounds: ConvergeRound[]
  majority_threshold: number
  total_active: number
  tie_breaks: TieBreak[]
  summary: {
    text: string
    total_rounds: number
    winner: string
    runner_up: string | null
    winning_percentage: number
  }
}
