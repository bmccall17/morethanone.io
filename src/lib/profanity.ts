const BLOCKLIST = [
  'ass',
  'asshole',
  'bastard',
  'bitch',
  'bollocks',
  'bullshit',
  'cock',
  'crap',
  'cunt',
  'damn',
  'dick',
  'fuck',
  'goddamn',
  'motherfucker',
  'nigger',
  'piss',
  'pussy',
  'shit',
  'slut',
  'twat',
  'wanker',
  'whore',
]

const PATTERN = `\\b(${BLOCKLIST.join('|')})\\b`

export function containsProfanity(text: string): boolean {
  return new RegExp(PATTERN, 'i').test(text)
}

export function cleanText(text: string): string {
  return text.replace(new RegExp(PATTERN, 'gi'), (match) => '*'.repeat(match.length))
}
