const BOT_NAMES = [
  'Captain Pickle',
  'Sir Wobbleton',
  'Disco Llama',
  'Professor Noodle',
  'Count Biscuit',
  'DJ Waffle',
  'Baron von Sprocket',
  'Lady Pancake',
  'Sergeant Fuzzbucket',
  'The Great Zamboni',
  'Doctor Sparkles',
  'Admiral Snackbar',
  'Pixel the Brave',
  'Turbo Hamster',
  'Mystic Taco',
  'Commander Jellybean',
  'Ninja Potato',
  'Agent Marshmallow',
  'Robo Cactus',
  'Funky Penguin',
]

export function pickBotNames(count: number): string[] {
  const shuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
