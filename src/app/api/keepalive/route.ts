import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  // Accept CRON_SECRET (Vercel cron) or METRICS_SECRET (manual ping)
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  const metricsSecret = process.env.METRICS_SECRET

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (metricsSecret && authHeader === `Bearer ${metricsSecret}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Insert keepalive ping
  const { error: insertError } = await supabase
    .from('keepalive_log')
    .insert({ status: 'ok' })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to log ping', detail: insertError.message }, { status: 500 })
  }

  // Clean up old rows, keep only last 100
  const { data: rows } = await supabase
    .from('keepalive_log')
    .select('id')
    .order('pinged_at', { ascending: false })
    .range(100, 999)

  if (rows && rows.length > 0) {
    await supabase
      .from('keepalive_log')
      .delete()
      .in('id', rows.map(r => r.id))
  }

  return NextResponse.json({ status: 'ok', pinged_at: new Date().toISOString() })
}
