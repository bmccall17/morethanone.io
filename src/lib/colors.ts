/** Shared color palette for option visualization across tally bars and selection grids. */
export const OPTION_PALETTE = [
  { hex: '#818cf8', text: 'text-white' },    // indigo-400
  { hex: '#34d399', text: 'text-gray-900' }, // emerald-400
  { hex: '#22d3ee', text: 'text-gray-900' }, // cyan-400
  { hex: '#fbbf24', text: 'text-gray-900' }, // amber-400
  { hex: '#fb7185', text: 'text-white' },    // rose-400
  { hex: '#a78bfa', text: 'text-white' },    // violet-400
  { hex: '#f472b6', text: 'text-white' },    // pink-400
  { hex: '#2dd4bf', text: 'text-gray-900' }, // teal-400
  { hex: '#f59e0b', text: 'text-gray-900' }, // amber-500
  { hex: '#6366f1', text: 'text-white' },    // indigo-500
  { hex: '#10b981', text: 'text-gray-900' }, // emerald-500
  { hex: '#ec4899', text: 'text-white' },    // pink-500
]

export function getOptionColor(index: number) {
  return OPTION_PALETTE[index % OPTION_PALETTE.length]
}
