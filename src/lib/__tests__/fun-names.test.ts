import { generateFunName } from '../fun-names'

describe('generateFunName', () => {
  test('returns a string with two words', () => {
    const name = generateFunName()
    const parts = name.split(' ')
    expect(parts).toHaveLength(2)
  })

  test('both words are capitalized', () => {
    for (let i = 0; i < 20; i++) {
      const name = generateFunName()
      const [adjective, animal] = name.split(' ')
      expect(adjective[0]).toBe(adjective[0].toUpperCase())
      expect(animal[0]).toBe(animal[0].toUpperCase())
    }
  })

  test('fits within 30 character display name limit', () => {
    for (let i = 0; i < 50; i++) {
      const name = generateFunName()
      expect(name.length).toBeLessThanOrEqual(30)
    }
  })

  test('produces varied results', () => {
    const names = new Set<string>()
    for (let i = 0; i < 20; i++) {
      names.add(generateFunName())
    }
    expect(names.size).toBeGreaterThan(1)
  })
})
