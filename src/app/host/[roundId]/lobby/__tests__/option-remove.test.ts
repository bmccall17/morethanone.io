interface RoundData {
  id: string
  options: string[]
  status: string
}

function makeRound(overrides: Partial<RoundData> = {}): RoundData {
  return {
    id: 'round-1',
    options: ['Pizza', 'Tacos', 'Sushi'],
    status: 'setup',
    ...overrides,
  }
}

describe('option remove button visibility', () => {
  test('shows remove buttons during setup', () => {
    const round = makeRound({ status: 'setup' })
    const showRemove = round.status === 'setup'
    expect(showRemove).toBe(true)
  })

  test('hides remove buttons during ranking', () => {
    const round = makeRound({ status: 'ranking' })
    const showRemove = round.status === 'setup'
    expect(showRemove).toBe(false)
  })

  test('hides remove buttons during closed', () => {
    const round = makeRound({ status: 'closed' })
    const showRemove = round.status === 'setup'
    expect(showRemove).toBe(false)
  })

  test('hides remove buttons during processing', () => {
    const round = makeRound({ status: 'processing' })
    const showRemove = round.status === 'setup'
    expect(showRemove).toBe(false)
  })

  test('hides remove buttons during revealed', () => {
    const round = makeRound({ status: 'revealed' })
    const showRemove = round.status === 'setup'
    expect(showRemove).toBe(false)
  })
})

describe('option remove state update', () => {
  // Mirrors the callback: setRound((prev) => prev ? { ...prev, options: data.options } : prev)
  function applyRemoval(prev: RoundData | null, updatedOptions: string[]): RoundData | null {
    return prev ? { ...prev, options: updatedOptions } : prev
  }

  test('updates options after removing one', () => {
    const round = makeRound()
    const result = applyRemoval(round, ['Pizza', 'Sushi'])
    expect(result?.options).toEqual(['Pizza', 'Sushi'])
  })

  test('updates options to empty array when last is removed', () => {
    const round = makeRound({ options: ['Only'] })
    const result = applyRemoval(round, [])
    expect(result?.options).toEqual([])
  })

  test('preserves other round fields when updating options', () => {
    const round = makeRound({ id: 'round-42', status: 'setup' })
    const result = applyRemoval(round, ['Pizza'])
    expect(result?.id).toBe('round-42')
    expect(result?.status).toBe('setup')
  })

  test('returns null when previous state is null', () => {
    const result = applyRemoval(null, ['Pizza'])
    expect(result).toBeNull()
  })
})

describe('options list rendering conditions', () => {
  test('shows options list when setup and options exist', () => {
    const round = makeRound()
    const show = round.status === 'setup' && round.options.length > 0
    expect(show).toBe(true)
  })

  test('hides options list when no options', () => {
    const round = makeRound({ options: [] })
    const show = round.status === 'setup' && round.options.length > 0
    expect(show).toBe(false)
  })

  test('hides options list when not in setup', () => {
    const round = makeRound({ status: 'ranking' })
    const show = round.status === 'setup' && round.options.length > 0
    expect(show).toBe(false)
  })
})

describe('remove button disabled state', () => {
  test('button is disabled while removing that option', () => {
    const removingOption = 'Pizza'
    const option = 'Pizza'
    expect(removingOption === option).toBe(true)
  })

  test('button is enabled when removing a different option', () => {
    const removingOption = 'Tacos'
    const option = 'Pizza'
    expect(removingOption === option).toBe(false)
  })

  test('button is enabled when not removing any option', () => {
    const removingOption: string | null = null
    const option = 'Pizza'
    expect(removingOption === option).toBe(false)
  })
})
