import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Fire-and-forget server-side event tracking.
 * Never throws — logs errors to console.
 */
export async function trackEvent(
  supabase: SupabaseClient,
  eventName: string,
  properties: Record<string, unknown> = {},
  roundId?: string
): Promise<void> {
  try {
    await supabase.from('events').insert({
      event_name: eventName,
      round_id: roundId || null,
      properties,
    })
  } catch (err) {
    console.error('[analytics] failed to track event:', eventName, err)
  }
}
