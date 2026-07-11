// Deterministic visitor identity — same visitor ID always maps to the same
// friendly name and avatar. Purely presentational; no PII involved.

const ADJECTIVES = [
  'swift', 'silent', 'brave', 'clever', 'gentle', 'lucky', 'mighty', 'noble',
  'quiet', 'rapid', 'shiny', 'bold', 'calm', 'eager', 'fuzzy', 'jolly',
  'keen', 'lively', 'merry', 'proud', 'witty', 'zesty', 'cosmic', 'golden',
  'crimson', 'azure', 'amber', 'jade', 'coral', 'violet', 'silver', 'wild',
]

const ANIMALS = [
  'parrotfish', 'otter', 'falcon', 'panda', 'lynx', 'heron', 'gecko', 'marlin',
  'badger', 'ferret', 'meerkat', 'narwhal', 'octopus', 'penguin', 'raccoon',
  'walrus', 'wombat', 'axolotl', 'capybara', 'dolphin', 'flamingo', 'hedgehog',
  'jaguar', 'koala', 'lemur', 'manta', 'pelican', 'quokka', 'seal', 'toucan',
  'viper', 'yak',
]

// Simple deterministic string hash (FNV-1a)
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface VisitorIdentity {
  name: string
  avatar: string
  initials: string
}

export function visitorIdentity(visitorId: string | undefined | null): VisitorIdentity {
  const id = visitorId || 'anonymous'
  const h = hash(id)
  const adjective = ADJECTIVES[h % ADJECTIVES.length]
  const animal = ANIMALS[Math.floor(h / ADJECTIVES.length) % ANIMALS.length]
  const name = `${adjective} ${animal}`

  // DiceBear avatar — deterministic from the visitor id, no API key needed.
  const avatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(id)}`

  const initials = `${adjective[0]}${animal[0]}`.toUpperCase()

  return { name, avatar, initials }
}
