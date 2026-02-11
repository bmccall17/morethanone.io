const ADJECTIVES = [
  'Brave', 'Swift', 'Chill', 'Bold', 'Cosmic',
  'Dizzy', 'Fuzzy', 'Groovy', 'Happy', 'Jazzy',
  'Lucky', 'Mighty', 'Noble', 'Peppy', 'Quirky',
  'Radical', 'Sneaky', 'Turbo', 'Wacky', 'Zesty',
  'Clever', 'Daring', 'Fierce', 'Gleeful', 'Hasty',
  'Jolly', 'Keen', 'Lively', 'Mellow', 'Nimble',
]

const ANIMALS = [
  'Otter', 'Penguin', 'Falcon', 'Panda', 'Fox',
  'Koala', 'Lynx', 'Badger', 'Raven', 'Gecko',
  'Sloth', 'Moose', 'Parrot', 'Dolphin', 'Ferret',
  'Toucan', 'Wombat', 'Lemur', 'Corgi', 'Iguana',
  'Quail', 'Stork', 'Viper', 'Yak', 'Alpaca',
  'Bison', 'Crane', 'Dingo', 'Heron', 'Newt',
]

export function generateFunName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${adjective} ${animal}`
}
