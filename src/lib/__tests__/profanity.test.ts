import { containsProfanity, cleanText } from '../profanity'

describe('containsProfanity', () => {
  test('detects profane words', () => {
    expect(containsProfanity('what the fuck')).toBe(true)
    expect(containsProfanity('you shit')).toBe(true)
    expect(containsProfanity('damn it')).toBe(true)
  })

  test('is case-insensitive', () => {
    expect(containsProfanity('FUCK')).toBe(true)
    expect(containsProfanity('Shit')).toBe(true)
    expect(containsProfanity('DaMn')).toBe(true)
  })

  test('matches whole words only', () => {
    expect(containsProfanity('class')).toBe(false)
    expect(containsProfanity('assassin')).toBe(false)
    expect(containsProfanity('scrapbook')).toBe(false)
    expect(containsProfanity('cockatoo')).toBe(false)
  })

  test('returns false for clean text', () => {
    expect(containsProfanity('hello world')).toBe(false)
    expect(containsProfanity('Player 1')).toBe(false)
    expect(containsProfanity('good morning')).toBe(false)
  })

  test('handles empty string', () => {
    expect(containsProfanity('')).toBe(false)
  })

  test('works correctly on consecutive calls', () => {
    expect(containsProfanity('fuck')).toBe(true)
    expect(containsProfanity('hello')).toBe(false)
    expect(containsProfanity('shit')).toBe(true)
    expect(containsProfanity('world')).toBe(false)
  })
})

describe('cleanText', () => {
  test('replaces profane words with asterisks', () => {
    expect(cleanText('what the fuck')).toBe('what the ****')
    expect(cleanText('oh shit')).toBe('oh ****')
  })

  test('replaces multiple profane words', () => {
    expect(cleanText('fuck this shit')).toBe('**** this ****')
  })

  test('preserves clean text', () => {
    expect(cleanText('hello world')).toBe('hello world')
  })

  test('is case-insensitive but preserves length', () => {
    expect(cleanText('FUCK')).toBe('****')
    expect(cleanText('Shit')).toBe('****')
  })

  test('does not replace partial matches', () => {
    expect(cleanText('class')).toBe('class')
    expect(cleanText('assassin')).toBe('assassin')
  })

  test('handles empty string', () => {
    expect(cleanText('')).toBe('')
  })
})
