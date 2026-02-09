export type RoundStatus = 'setup' | 'ranking' | 'closed' | 'revealed'

export interface RoundSettings {
  allowTies: boolean
  anonymousResults: boolean
  host_as_participant: boolean
  show_processing: boolean
}

export interface Round {
  id: string
  join_code: string
  prompt: string
  description: string | null
  options: string[]
  settings: RoundSettings
  status: RoundStatus
  host_token: string
  created_at: string
}

export interface Participant {
  id: string
  round_id: string
  display_name: string
  removed: boolean
  joined_at: string
}

export interface Ranking {
  id: string
  round_id: string
  participant_id: string
  ranking: string[]
  submitted_at: string
}

export interface Result {
  id: string
  round_id: string
  winner: string
  majority_threshold: number
  total_active: number
  rounds_data: RoundData[]
  tie_break_info: string | null
  summary: ResultSummary
  computed_at: string
}

export interface RoundData {
  round_number: number
  tallies: Record<string, number>
  eliminated: string | null
  transfers: Transfer[]
  active: number
  inactive: number
  threshold: number
}

export interface Transfer {
  from: string
  to: string | null
  count: number
}

export interface ResultSummary {
  text: string
  total_rounds: number
  winner: string
  runner_up: string | null
  winning_percentage: number
}
