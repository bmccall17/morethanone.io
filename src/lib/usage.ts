import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Fire-and-forget usage logging for cost monitoring.
 * Never throws — logs errors to console.
 */
export async function logUsage(
  supabase: SupabaseClient,
  category: 'gemini' | 'function',
  action: string,
  opts: {
    tokens_in?: number
    tokens_out?: number
    tokens_total?: number
    duration_ms?: number
    metadata?: Record<string, unknown>
  } = {}
): Promise<void> {
  try {
    await supabase.from('usage_log').insert({
      category,
      action,
      tokens_in: opts.tokens_in ?? null,
      tokens_out: opts.tokens_out ?? null,
      tokens_total: opts.tokens_total ?? null,
      duration_ms: opts.duration_ms ?? null,
      metadata: opts.metadata ?? {},
    })
  } catch (err) {
    console.error('[usage] failed to log:', category, action, err)
  }
}
