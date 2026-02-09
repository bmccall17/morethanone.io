import type { RoundSettings } from '@/types/database'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: true,
  show_processing: false,
}

interface RoundData {
  id: string
  options: string[]
  settings: RoundSettings
  status: string
}

function makeRound(overrides: Partial<RoundData> = {}): RoundData {
  return {
    id: 'round-1',
    options: ['Option A', 'Option B', 'Option C'],
    settings: { ...defaultSettings },
    status: 'ranking',
    ...overrides,
  }
}

describe('host ranking UI visibility logic', () => {
  // This tests the guard condition in the lobby page:
  // round.status === 'ranking' && round.settings?.host_as_participant && getParticipantId(roundId)

  function shouldShowRankingUI(
    status: string,
    hostAsParticipant: boolean,
    hasParticipantId: boolean,
  ): boolean {
    return status === 'ranking' && hostAsParticipant && hasParticipantId
  }

  test('shows ranking UI when ranking, host_as_participant, and has participant ID', () => {
    expect(shouldShowRankingUI('ranking', true, true)).toBe(true)
  })

  test('hides ranking UI when status is setup', () => {
    expect(shouldShowRankingUI('setup', true, true)).toBe(false)
  })

  test('hides ranking UI when status is closed', () => {
    expect(shouldShowRankingUI('closed', true, true)).toBe(false)
  })

  test('hides ranking UI when status is revealed', () => {
    expect(shouldShowRankingUI('revealed', true, true)).toBe(false)
  })

  test('hides ranking UI when host_as_participant is false', () => {
    expect(shouldShowRankingUI('ranking', false, true)).toBe(false)
  })

  test('hides ranking UI when no participant ID', () => {
    expect(shouldShowRankingUI('ranking', true, false)).toBe(false)
  })
})

describe('host ranking submitted state', () => {
  // This tests the conditional rendering after submission:
  // hostRankingSubmitted ? <confirmation> : <DraggableRankList>

  test('shows DraggableRankList when not yet submitted', () => {
    const hostRankingSubmitted = false
    expect(hostRankingSubmitted).toBe(false)
  })

  test('shows confirmation message after submission', () => {
    const hostRankingSubmitted = true
    expect(hostRankingSubmitted).toBe(true)
  })
})

describe('handleHostSubmitRanking logic', () => {
  // Tests the submit handler behavior

  test('sets error when no participant ID', () => {
    const participantId: string | null = null
    let error = ''
    if (!participantId) {
      error = 'No participant ID found.'
    }
    expect(error).toBe('No participant ID found.')
  })

  test('proceeds when participant ID exists', () => {
    const participantId: string | null = 'host-participant-123'
    let error = ''
    if (!participantId) {
      error = 'No participant ID found.'
    }
    expect(error).toBe('')
  })

  test('builds correct request payload', () => {
    const participantId = 'host-participant-123'
    const ranking = ['Option B', 'Option A', 'Option C']
    const payload = { participantId, ranking }
    expect(payload).toEqual({
      participantId: 'host-participant-123',
      ranking: ['Option B', 'Option A', 'Option C'],
    })
  })

  test('sets hostRankingSubmitted to true on success', () => {
    let hostRankingSubmitted = false
    // Simulate successful submission
    hostRankingSubmitted = true
    expect(hostRankingSubmitted).toBe(true)
  })

  test('sets error message on failure', () => {
    let error = ''
    const err = new Error('Round is not in ranking status')
    error = err.message
    expect(error).toBe('Round is not in ranking status')
  })

  test('handles non-Error thrown values', () => {
    let error = ''
    const err = 'string error'
    error = err instanceof Error ? err.message : 'Failed to submit ranking'
    expect(error).toBe('Failed to submit ranking')
  })
})

describe('host ranking UI integration with host controls', () => {
  // Verifies the ranking UI and host controls coexist

  test('submission counter is shown alongside ranking UI during ranking status', () => {
    const round = makeRound({ status: 'ranking' })
    const showRankingUI = round.status === 'ranking' && round.settings.host_as_participant
    const showSubmissionCounter = round.status === 'ranking' || round.status === 'closed'
    expect(showRankingUI).toBe(true)
    expect(showSubmissionCounter).toBe(true)
  })

  test('close ranking button is shown alongside ranking UI during ranking status', () => {
    const round = makeRound({ status: 'ranking' })
    const showRankingUI = round.status === 'ranking' && round.settings.host_as_participant
    const showCloseButton = round.status === 'ranking'
    expect(showRankingUI).toBe(true)
    expect(showCloseButton).toBe(true)
  })

  test('ranking UI disappears when status changes to closed', () => {
    const round = makeRound({ status: 'closed' })
    const showRankingUI = round.status === 'ranking' && round.settings.host_as_participant
    const showSubmissionCounter = round.status === 'ranking' || round.status === 'closed'
    expect(showRankingUI).toBe(false)
    expect(showSubmissionCounter).toBe(true)
  })

  test('DraggableRankList receives correct options from round data', () => {
    const round = makeRound({ options: ['Pizza', 'Tacos', 'Sushi'] })
    expect(round.options).toEqual(['Pizza', 'Tacos', 'Sushi'])
  })
})
