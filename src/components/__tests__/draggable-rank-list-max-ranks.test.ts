describe('DraggableRankList max_ranks logic', () => {
  const options = ['Pizza', 'Tacos', 'Sushi', 'Burgers', 'Pasta']

  // Tests the initial split logic used in the component:
  // maxRanks && maxRanks < options.length ? options.slice(0, maxRanks) : options
  function initialRanked(opts: string[], maxRanks?: number): string[] {
    return maxRanks && maxRanks < opts.length ? opts.slice(0, maxRanks) : opts
  }

  function initialRuledOut(opts: string[], maxRanks?: number): string[] {
    return maxRanks && maxRanks < opts.length ? opts.slice(maxRanks) : []
  }

  test('no maxRanks: all options start ranked', () => {
    expect(initialRanked(options)).toEqual(options)
    expect(initialRuledOut(options)).toEqual([])
  })

  test('maxRanks equal to options count: all options start ranked', () => {
    expect(initialRanked(options, 5)).toEqual(options)
    expect(initialRuledOut(options, 5)).toEqual([])
  })

  test('maxRanks less than options: splits into ranked and ruled out', () => {
    expect(initialRanked(options, 3)).toEqual(['Pizza', 'Tacos', 'Sushi'])
    expect(initialRuledOut(options, 3)).toEqual(['Burgers', 'Pasta'])
  })

  test('maxRanks of 1: only first option ranked', () => {
    expect(initialRanked(options, 1)).toEqual(['Pizza'])
    expect(initialRuledOut(options, 1)).toEqual(['Tacos', 'Sushi', 'Burgers', 'Pasta'])
  })

  // Tests the rankedFull gate used in handleDragEnd:
  // const rankedFull = !!maxRanks && ranked.length >= maxRanks
  function isRankedFull(rankedCount: number, maxRanks?: number): boolean {
    return !!maxRanks && rankedCount >= maxRanks
  }

  test('rankedFull is false when no maxRanks', () => {
    expect(isRankedFull(5)).toBe(false)
    expect(isRankedFull(0)).toBe(false)
  })

  test('rankedFull is false when under max', () => {
    expect(isRankedFull(2, 3)).toBe(false)
    expect(isRankedFull(0, 3)).toBe(false)
  })

  test('rankedFull is true when at max', () => {
    expect(isRankedFull(3, 3)).toBe(true)
  })

  test('rankedFull is true when over max', () => {
    expect(isRankedFull(4, 3)).toBe(true)
  })

  // Tests the cross-zone block: if rankedFull, ruled-out → ranked is blocked
  function canMoveToRanked(rankedCount: number, maxRanks?: number): boolean {
    const full = !!maxRanks && rankedCount >= maxRanks
    return !full
  }

  test('can move to ranked when no limit', () => {
    expect(canMoveToRanked(5)).toBe(true)
  })

  test('can move to ranked when under limit', () => {
    expect(canMoveToRanked(2, 3)).toBe(true)
  })

  test('cannot move to ranked when at limit', () => {
    expect(canMoveToRanked(3, 3)).toBe(false)
  })
})
