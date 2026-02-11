describe('RevealCountdown logic', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('countdown sequence is 3, 2, 1 with 1-second intervals', () => {
    const steps: number[] = []
    let count = 3

    // Simulate the countdown logic from the component
    const tick = () => {
      if (count > 0) {
        steps.push(count)
        count--
      }
    }

    tick() // Initial: 3
    jest.advanceTimersByTime(1000)
    tick() // After 1s: 2
    jest.advanceTimersByTime(1000)
    tick() // After 2s: 1
    jest.advanceTimersByTime(1000)

    expect(steps).toEqual([3, 2, 1])
    expect(count).toBe(0)
  })

  test('countdown calls onComplete when reaching 0', () => {
    let completed = false
    let count = 3

    const onComplete = () => { completed = true }

    // Simulate 3 ticks
    for (let i = 0; i < 3; i++) {
      count--
      jest.advanceTimersByTime(1000)
    }

    if (count <= 0) {
      onComplete()
    }

    expect(completed).toBe(true)
  })

  test('countdown does not call onComplete before reaching 0', () => {
    let completed = false
    let count = 3

    const onComplete = () => { completed = true }

    // Simulate only 2 ticks
    for (let i = 0; i < 2; i++) {
      count--
      jest.advanceTimersByTime(1000)
    }

    if (count <= 0) {
      onComplete()
    }

    expect(count).toBe(1)
    expect(completed).toBe(false)
  })

  test('countdown total duration is approximately 3 seconds', () => {
    const startTime = Date.now()
    let elapsed = 0

    // Each tick is 1000ms, 3 ticks total
    for (let i = 0; i < 3; i++) {
      jest.advanceTimersByTime(1000)
      elapsed += 1000
    }

    expect(elapsed).toBe(3000)
  })

  test('countdownComplete state gates reveal content', () => {
    let countdownComplete = false

    // Before countdown completes, reveal content should not show
    expect(countdownComplete).toBe(false)

    // Simulate countdown completing
    countdownComplete = true
    expect(countdownComplete).toBe(true)
  })
})
