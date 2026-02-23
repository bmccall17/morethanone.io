import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // --- Gemini usage from usage_log ---
  const { data: usageLogs } = await supabase
    .from('usage_log')
    .select('action, tokens_in, tokens_out, tokens_total, created_at')
    .eq('category', 'gemini')
    .order('created_at', { ascending: false })

  const geminiLogs = usageLogs || []
  const geminiTotalCalls = geminiLogs.length
  const geminiTotalTokensIn = geminiLogs.reduce((s, r) => s + (r.tokens_in || 0), 0)
  const geminiTotalTokensOut = geminiLogs.reduce((s, r) => s + (r.tokens_out || 0), 0)
  const geminiTotalTokens = geminiLogs.reduce((s, r) => s + (r.tokens_total || 0), 0)
  // Gemini 2.5 Flash pricing: $0.15/1M input, $0.60/1M output
  const geminiEstCost = (geminiTotalTokensIn * 0.15 + geminiTotalTokensOut * 0.60) / 1_000_000

  const geminiByDay: Record<string, { calls: number; tokens: number }> = {}
  for (const row of geminiLogs) {
    const day = row.created_at.slice(0, 10)
    if (!geminiByDay[day]) geminiByDay[day] = { calls: 0, tokens: 0 }
    geminiByDay[day].calls++
    geminiByDay[day].tokens += row.tokens_total || 0
  }

  // --- Function activity from events table ---
  const now = new Date()
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString()
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString()

  const { count: eventsTotal } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  const { count: events30d } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', d30)

  const { count: events7d } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', d7)

  // Events by type (last 30d)
  const { data: recentEvents } = await supabase
    .from('events')
    .select('event_name, created_at')
    .gte('created_at', d30)

  const eventsByType: Record<string, number> = {}
  const eventsByDay: Record<string, number> = {}
  for (const e of recentEvents || []) {
    eventsByType[e.event_name] = (eventsByType[e.event_name] || 0) + 1
    const day = e.created_at.slice(0, 10)
    eventsByDay[day] = (eventsByDay[day] || 0) + 1
  }

  // --- Supabase DB size via get_table_sizes() RPC ---
  let tables: { name: string; bytes: number }[] = []
  let totalBytes = 0

  try {
    const { data: tableRows } = await supabase.rpc('get_table_sizes')
    if (tableRows && Array.isArray(tableRows)) {
      tables = tableRows as { name: string; bytes: number }[]
      totalBytes = tables.reduce((s, t) => s + (t.bytes || 0), 0)
    }
  } catch {
    // RPC not yet created — supabase section will show zeros
  }

  return NextResponse.json({
    gemini: {
      total_calls: geminiTotalCalls,
      total_tokens: geminiTotalTokens,
      total_tokens_in: geminiTotalTokensIn,
      total_tokens_out: geminiTotalTokensOut,
      est_cost_usd: Math.round(geminiEstCost * 1000000) / 1000000,
      by_day: geminiByDay,
    },
    functions: {
      events_7d: events7d || 0,
      events_30d: events30d || 0,
      events_total: eventsTotal || 0,
      by_day: eventsByDay,
      by_type: eventsByType,
    },
    supabase: {
      total_bytes: totalBytes,
      limit_bytes: 524288000,
      tables,
    },
  })
}
