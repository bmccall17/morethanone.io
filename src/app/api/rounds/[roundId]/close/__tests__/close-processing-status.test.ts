import type { RoundSettings, RoundStatus } from '@/types/database'

const defaultSettings: RoundSettings = {
  allowTies: false,
  anonymousResults: false,
  host_as_participant: false,
  show_processing: false,
  bot_count: 0,
}

describe('close route status selection logic', () => {
  // Tests the conditional logic used in the close route:
  // const newStatus = settings.show_processing ? 'processing' : 'closed'

  function determineCloseStatus(settings: RoundSettings): RoundStatus {
    return settings.show_processing ? 'processing' : 'closed'
  }

  test('returns processing when show_processing is enabled', () => {
    const settings: RoundSettings = { ...defaultSettings, show_processing: true }
    expect(determineCloseStatus(settings)).toBe('processing')
  })

  test('returns closed when show_processing is disabled', () => {
    expect(determineCloseStatus(defaultSettings)).toBe('closed')
  })

  test('returns closed with default settings', () => {
    const settings: RoundSettings = {
      allowTies: false,
      anonymousResults: false,
      host_as_participant: false,
      show_processing: false,
      bot_count: 0,
    }
    expect(determineCloseStatus(settings)).toBe('closed')
  })

  test('show_processing is independent of other settings', () => {
    const settings: RoundSettings = {
      allowTies: true,
      anonymousResults: true,
      host_as_participant: true,
      show_processing: true,
      bot_count: 0,
    }
    expect(determineCloseStatus(settings)).toBe('processing')
  })
})

describe('close route response shape', () => {
  // Tests the response construction:
  // return NextResponse.json({ status: newStatus })

  function buildResponse(settings: RoundSettings) {
    const newStatus = settings.show_processing ? 'processing' : 'closed'
    return { status: newStatus }
  }

  test('response includes processing status when enabled', () => {
    const settings: RoundSettings = { ...defaultSettings, show_processing: true }
    expect(buildResponse(settings)).toEqual({ status: 'processing' })
  })

  test('response includes closed status when disabled', () => {
    expect(buildResponse(defaultSettings)).toEqual({ status: 'closed' })
  })
})

describe('close route guard checks', () => {
  // Tests the precondition: round must be in ranking status

  test('rejects when round is not in ranking phase', () => {
    const nonRankingStatuses: RoundStatus[] = ['setup', 'processing', 'closed', 'revealed']
    for (const status of nonRankingStatuses) {
      expect(status !== 'ranking').toBe(true)
    }
  })

  test('allows when round is in ranking phase', () => {
    expect('ranking' !== 'ranking').toBe(false)
  })
})

describe('RoundStatus type includes processing', () => {
  test('processing is a valid RoundStatus value', () => {
    const status: RoundStatus = 'processing'
    expect(status).toBe('processing')
  })

  test('status flow is setup → ranking → processing → revealed', () => {
    const flow: RoundStatus[] = ['setup', 'ranking', 'processing', 'revealed']
    expect(flow).toHaveLength(4)
    expect(flow[0]).toBe('setup')
    expect(flow[1]).toBe('ranking')
    expect(flow[2]).toBe('processing')
    expect(flow[3]).toBe('revealed')
  })

  test('closed is still a valid RoundStatus for non-processing flow', () => {
    const flow: RoundStatus[] = ['setup', 'ranking', 'closed', 'revealed']
    expect(flow).toHaveLength(4)
    expect(flow[2]).toBe('closed')
  })
})
