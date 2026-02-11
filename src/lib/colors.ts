/** Shared tiered color palette for option visualization across tally bars, selection grids, and reveal animation. */

import type { CSSProperties } from 'react'

export type Modifier = 'solid' | 'striped' | 'crosshatch'
export type Shape = 'circle' | 'diamond' | 'square'

export interface OptionStyle {
  hex: string
  text: string
  modifier: Modifier
  shape: Shape
  tier: number
}

/** 8 maximally distinct base colors */
const BASE_COLORS: { hex: string; text: string }[] = [
  { hex: '#818cf8', text: 'text-white' },      // indigo
  { hex: '#34d399', text: 'text-gray-900' },   // emerald
  { hex: '#22d3ee', text: 'text-gray-900' },   // cyan
  { hex: '#fbbf24', text: 'text-gray-900' },   // amber
  { hex: '#fb7185', text: 'text-white' },      // rose
  { hex: '#a78bfa', text: 'text-white' },      // violet
  { hex: '#f97316', text: 'text-white' },      // orange
  { hex: '#2dd4bf', text: 'text-gray-900' },   // teal
]

const MODIFIERS: Modifier[] = ['solid', 'striped', 'crosshatch']
const SHAPES: Shape[] = ['circle', 'diamond', 'square']

/** Get full style information for an option at the given index. Supports 24 unique combos (8 colors x 3 tiers). */
export function getOptionStyle(index: number): OptionStyle {
  const tier = Math.floor(index / BASE_COLORS.length) % MODIFIERS.length
  const colorIdx = index % BASE_COLORS.length
  const base = BASE_COLORS[colorIdx]
  return {
    hex: base.hex,
    text: base.text,
    modifier: MODIFIERS[tier],
    shape: SHAPES[tier],
    tier,
  }
}

/** CSS background for a bar/badge surface: solid, diagonal stripes, or crosshatch overlay on top of the base color. */
export function getPatternStyle(modifier: Modifier, hex: string): CSSProperties {
  if (modifier === 'striped') {
    return {
      background: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.35) 4px, rgba(255,255,255,0.35) 8px), ${hex}`,
    }
  }
  if (modifier === 'crosshatch') {
    return {
      background: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.35) 4px, rgba(255,255,255,0.35) 8px), repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.35) 4px, rgba(255,255,255,0.35) 8px), ${hex}`,
    }
  }
  return { backgroundColor: hex }
}

/** Tailwind classes for dot/marker shape: circle (default), diamond (rotated square), or plain square. */
export function getShapeClass(shape: Shape): string {
  if (shape === 'diamond') return 'rounded-sm rotate-45'
  if (shape === 'square') return 'rounded-sm'
  return 'rounded-full'
}

/** Inset box-shadow for tier 2/3 circles to add ring treatment without conflicting with active-state outline. */
export function getTierBorderStyle(tier: number): CSSProperties {
  if (tier === 1) {
    return { boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.7)' }
  }
  if (tier === 2) {
    return { boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.7), inset 0 0 0 4px transparent, inset 0 0 0 5px rgba(255,255,255,0.7)' }
  }
  return {}
}

/** Backward-compatible wrapper returning just { hex, text } for an option index. */
export function getOptionColor(index: number) {
  const style = getOptionStyle(index)
  return { hex: style.hex, text: style.text }
}

/** Re-export for backward compatibility */
export const OPTION_PALETTE = BASE_COLORS.map((c, i) => ({ ...c, ...getOptionStyle(i) }))
