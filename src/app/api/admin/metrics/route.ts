import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const secret = process.env.METRICS_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Fetch revealed rounds (limit 500 most recent)
  const { data: rounds } = await supabase
    .from('rounds')
    .select('id, prompt, status, settings, ranking_started_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  const allRounds = rounds || []
  const revealedRounds = allRounds.filter(r => r.status === 'revealed')

  // Fetch results for revealed rounds
  const revealedIds = revealedRounds.map(r => r.id)
  const { data: results } = await supabase
    .from('results')
    .select('round_id, winner, rounds_data, tie_break_info, computed_at')
    .in('round_id', revealedIds.length > 0 ? revealedIds : ['none'])

  const resultsMap = new Map((results || []).map(r => [r.round_id, r]))

  // Fetch participant and ranking counts per round
  const { data: participantCounts } = await supabase
    .from('participants')
    .select('round_id')
    .eq('removed', false)
    .in('round_id', revealedIds.length > 0 ? revealedIds : ['none'])

  const { data: rankingCounts } = await supabase
    .from('rankings')
    .select('round_id')
    .in('round_id', revealedIds.length > 0 ? revealedIds : ['none'])

  // Count per round
  const participantsByRound = new Map<string, number>()
  for (const p of participantCounts || []) {
    participantsByRound.set(p.round_id, (participantsByRound.get(p.round_id) || 0) + 1)
  }
  const rankingsByRound = new Map<string, number>()
  for (const r of rankingCounts || []) {
    rankingsByRound.set(r.round_id, (rankingsByRound.get(r.round_id) || 0) + 1)
  }

  // Totals
  const totalRounds = allRounds.length
  const completedRounds = revealedRounds.length
  let totalParticipants = 0
  let totalBallots = 0
  for (const [, count] of participantsByRound) totalParticipants += count
  for (const [, count] of rankingsByRound) totalBallots += count

  // Completion rate buckets
  const completionBuckets = [0, 0, 0, 0] // 0-25, 26-50, 51-75, 76-100
  for (const r of revealedRounds) {
    const participants = participantsByRound.get(r.id) || 0
    const rankings = rankingsByRound.get(r.id) || 0
    if (participants === 0) continue
    const rate = (rankings / participants) * 100
    if (rate <= 25) completionBuckets[0]++
    else if (rate <= 50) completionBuckets[1]++
    else if (rate <= 75) completionBuckets[2]++
    else completionBuckets[3]++
  }

  // Rounds to converge distribution
  const convergeDist = [0, 0, 0, 0] // 1, 2, 3, 4+
  for (const r of revealedRounds) {
    const result = resultsMap.get(r.id)
    if (!result) continue
    const roundsData = result.rounds_data as unknown[]
    const count = Array.isArray(roundsData) ? roundsData.length : 0
    if (count <= 1) convergeDist[0]++
    else if (count === 2) convergeDist[1]++
    else if (count === 3) convergeDist[2]++
    else convergeDist[3]++
  }

  // Tie-break frequency
  let tieBreakCount = 0
  for (const r of revealedRounds) {
    const result = resultsMap.get(r.id)
    if (result?.tie_break_info) tieBreakCount++
  }
  const tieBreakPct = completedRounds > 0 ? Math.round((tieBreakCount / completedRounds) * 100) : 0

  // Time to converge (avg seconds from ranking_started_at to computed_at)
  let totalTimeMs = 0
  let timeCount = 0
  for (const r of revealedRounds) {
    const result = resultsMap.get(r.id)
    if (!result || !r.ranking_started_at) continue
    const start = new Date(r.ranking_started_at).getTime()
    const end = new Date(result.computed_at).getTime()
    if (end > start) {
      totalTimeMs += end - start
      timeCount++
    }
  }
  const avgTimeSeconds = timeCount > 0 ? Math.round(totalTimeMs / timeCount / 1000) : 0

  // Recent rounds table (last 20)
  const recentRounds = revealedRounds.slice(0, 20).map(r => {
    const result = resultsMap.get(r.id)
    const participants = participantsByRound.get(r.id) || 0
    const rankings = rankingsByRound.get(r.id) || 0
    const roundsData = result?.rounds_data as unknown[]
    return {
      id: r.id,
      prompt: r.prompt,
      players: participants,
      ballots: rankings,
      completion_pct: participants > 0 ? Math.round((rankings / participants) * 100) : 0,
      rounds_count: Array.isArray(roundsData) ? roundsData.length : 0,
      tie_break: !!result?.tie_break_info,
      winner: result?.winner || null,
      created_at: r.created_at,
    }
  })

  return NextResponse.json({
    overview: {
      total_rounds: totalRounds,
      completed_rounds: completedRounds,
      total_participants: totalParticipants,
      total_ballots: totalBallots,
    },
    completion_buckets: completionBuckets,
    converge_distribution: convergeDist,
    tie_break_pct: tieBreakPct,
    avg_time_seconds: avgTimeSeconds,
    recent_rounds: recentRounds,
  })
}
