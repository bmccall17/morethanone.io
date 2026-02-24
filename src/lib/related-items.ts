const VALID_TYPES = ['round', 'faq', 'rcv_world', 'template', 'content_section', 'demo'] as const

export type RelatedItemType = typeof VALID_TYPES[number]

export interface RelatedItem {
  type: RelatedItemType
  id: string
  label: string
}

export function validateRelatedItems(input: unknown): RelatedItem[] {
  if (!Array.isArray(input)) return []
  return input.filter(
    (item): item is RelatedItem =>
      item &&
      typeof item.type === 'string' &&
      VALID_TYPES.includes(item.type as RelatedItemType) &&
      typeof item.id === 'string' &&
      typeof item.label === 'string'
  )
}
