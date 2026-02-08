const HOST_TOKEN_PREFIX = 'morethanone:host:'
const PARTICIPANT_PREFIX = 'morethanone:participant:'

export function generateHostToken(): string {
  return crypto.randomUUID()
}

export function saveHostToken(roundId: string, token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${HOST_TOKEN_PREFIX}${roundId}`, token)
}

export function getHostToken(roundId: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(`${HOST_TOKEN_PREFIX}${roundId}`)
}

export function isHost(roundId: string): boolean {
  return getHostToken(roundId) !== null
}

export function saveParticipantId(roundId: string, participantId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${PARTICIPANT_PREFIX}${roundId}`, participantId)
}

export function getParticipantId(roundId: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(`${PARTICIPANT_PREFIX}${roundId}`)
}

export function getHostHeaders(roundId: string): Record<string, string> {
  const token = getHostToken(roundId)
  if (!token) return {}
  return { 'X-Host-Token': token }
}
