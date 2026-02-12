/**
 * Synthesized drag sounds via Web Audio API + haptic feedback.
 * Zero dependencies. All functions no-op in SSR.
 */

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    ctx = new AudioContext()
  }
  return ctx
}

function vibrate(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

function playTone(frequency: number, duration: number, gain: number, type: OscillatorType): void {
  const audioCtx = getContext()
  if (!audioCtx) return

  // Resume context if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  const osc = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime)
  gainNode.gain.setValueAtTime(gain, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000)

  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  osc.start()
  osc.stop(audioCtx.currentTime + duration / 1000)
}

export function playPickUp(): void {
  playTone(600, 50, 0.12, 'sine')
  vibrate(10)
}

export function playDrop(): void {
  playTone(300, 80, 0.15, 'triangle')
  vibrate([5, 5, 15])
}

export function playReorder(): void {
  playTone(800, 30, 0.08, 'sine')
  vibrate(5)
}
