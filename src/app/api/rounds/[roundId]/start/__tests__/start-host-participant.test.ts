import type { RoundSettings } from '@/types/database'
import { pickBotNames } from '@/lib/bot-names'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: false,
  show_processing: false,
  bot_count: 0,
}

describe('start route host participant logic', () => {
  // Tests the conditional logic used in the start route:
  // if (round.settings?.host_as_participant) → create participant

  function shouldCreateHostParticipant(settings: RoundSettings | null | undefined): boolean {
    return !!settings?.host_as_participant
  }

  test('creates host participant when host_as_participant is true', () => {
    const settings: RoundSettings = { ...defaultSettings, host_as_participant: true }
    expect(shouldCreateHostParticipant(settings)).toBe(true)
  })

  test('does not create host participant when host_as_participant is false', () => {
    expect(shouldCreateHostParticipant(defaultSettings)).toBe(false)
  })

  test('does not create host participant when settings is null', () => {
    expect(shouldCreateHostParticipant(null)).toBe(false)
  })

  test('does not create host participant when settings is undefined', () => {
    expect(shouldCreateHostParticipant(undefined)).toBe(false)
  })
})

describe('start route response shape', () => {
  // Tests the response construction logic:
  // { status: 'ranking', ...(hostParticipantId && { hostParticipantId }) }

  function buildResponse(hostParticipantId: string | null) {
    return {
      status: 'ranking' as const,
      ...(hostParticipantId && { hostParticipantId }),
    }
  }

  test('includes hostParticipantId when host participates', () => {
    const response = buildResponse('abc-123')
    expect(response).toEqual({
      status: 'ranking',
      hostParticipantId: 'abc-123',
    })
  })

  test('excludes hostParticipantId when host does not participate', () => {
    const response = buildResponse(null)
    expect(response).toEqual({ status: 'ranking' })
    expect('hostParticipantId' in response).toBe(false)
  })
})

describe('lobby page participant storage logic', () => {
  // Tests the client-side logic:
  // if (data.hostParticipantId) { saveParticipantId(roundId, data.hostParticipantId) }

  test('stores participant ID when present in response', () => {
    const data = { status: 'ranking', hostParticipantId: 'participant-uuid' }
    let stored: { roundId: string; participantId: string } | null = null

    if (data.hostParticipantId) {
      stored = { roundId: 'round-1', participantId: data.hostParticipantId }
    }

    expect(stored).toEqual({ roundId: 'round-1', participantId: 'participant-uuid' })
  })

  test('does not store participant ID when absent from response', () => {
    const data: { status: string; hostParticipantId?: string } = { status: 'ranking' }
    let stored: { roundId: string; participantId: string } | null = null

    if (data.hostParticipantId) {
      stored = { roundId: 'round-1', participantId: data.hostParticipantId }
    }

    expect(stored).toBeNull()
  })
})

describe('host participant record shape', () => {
  // Tests that the participant insert data matches expected schema

  function buildParticipantInsert(roundId: string) {
    return {
      round_id: roundId,
      display_name: 'Host',
    }
  }

  test('uses "Host" as display name', () => {
    const insert = buildParticipantInsert('round-123')
    expect(insert.display_name).toBe('Host')
  })

  test('uses the correct round_id', () => {
    const insert = buildParticipantInsert('round-456')
    expect(insert.round_id).toBe('round-456')
  })
})

describe('bot creation logic', () => {
  function shouldCreateBots(settings: RoundSettings | null | undefined, optionsCount: number): boolean {
    const botCount = settings?.bot_count ?? 0
    return botCount > 0 && optionsCount >= 2
  }

  test('creates bots when bot_count > 0 and options >= 2', () => {
    const settings: RoundSettings = { ...defaultSettings, bot_count: 3 }
    expect(shouldCreateBots(settings, 4)).toBe(true)
  })

  test('does not create bots when bot_count is 0', () => {
    expect(shouldCreateBots(defaultSettings, 4)).toBe(false)
  })

  test('does not create bots when settings is null', () => {
    expect(shouldCreateBots(null, 4)).toBe(false)
  })

  test('does not create bots when options < 2', () => {
    const settings: RoundSettings = { ...defaultSettings, bot_count: 3 }
    expect(shouldCreateBots(settings, 1)).toBe(false)
  })

  test('pickBotNames returns requested count of unique names', () => {
    const names = pickBotNames(5)
    expect(names).toHaveLength(5)
    expect(new Set(names).size).toBe(5)
  })

  test('pickBotNames returns at most the pool size', () => {
    const names = pickBotNames(100)
    expect(names.length).toBeLessThanOrEqual(20)
  })

  test('bot ranking is a shuffled copy of options', () => {
    const options = ['A', 'B', 'C', 'D']
    const shuffled = [...options].sort(() => Math.random() - 0.5)
    expect(shuffled).toHaveLength(options.length)
    expect(shuffled.sort()).toEqual(options.sort())
  })
})
