logSmartPublicRoundStatuses+HostHeartbeat.md
│ Plan to implement                                                                                                │
│                                                                                                                  │
│ Plan: Smart Public Round Statuses + Host Heartbeat                                                               │
│                                                                                                                  │
│ Context                                                                                                          │
│                                                                                                                  │
│ The public rounds list on /join currently shows all non-private setup/ranking rounds as either "Open" or         │
│ "Ranking". The user wants:                                                                                       │
│ 1. Completed rounds shown with a "Completed" badge, linking to /results/[roundId] instead of filling the join    │
│ code                                                                                                             │
│ 2. "Open" label only for rounds where the host is actively present AND voting hasn't started (status=setup)      │
│ 3. Other states labeled appropriately (e.g., "Voting" for ranking, "Processing" for mid-processing)              │
│                                                                                                                  │
│ Problem: There's no host presence tracking in the app. All host pages use Supabase realtime subscriptions — no   │
│ polling, no heartbeat, no last_seen column.                                                                      │
│                                                                                                                  │
│ Approach                                                                                                         │
│                                                                                                                  │
│ 1. Host heartbeat system                                                                                         │
│                                                                                                                  │
│ Migration — supabase/migrations/add_host_heartbeat.sql                                                           │
│ ALTER TABLE rounds ADD COLUMN IF NOT EXISTS host_heartbeat_at timestamptz;                                       │
│                                                                                                                  │
│ Schema — supabase/schema.sql — add host_heartbeat_at timestamptz after is_private                                │
│                                                                                                                  │
│ TypeScript — src/types/database.ts — add host_heartbeat_at: string | null to Round                               │
│                                                                                                                  │
│ Heartbeat API — new src/app/api/rounds/[roundId]/heartbeat/route.ts                                              │
│ - PATCH handler, requires X-Host-Token header (same pattern as start/close/reveal)                               │
│ - Updates host_heartbeat_at = now() where id = roundId and host_token matches                                    │
│ - Lightweight — no state changes, just timestamp                                                                 │
│                                                                                                                  │
│ Custom hook — new src/lib/useHostHeartbeat.ts                                                                    │
│ - useHostHeartbeat(roundId: string) — calls PATCH /api/rounds/{roundId}/heartbeat on mount and every 30 seconds  │
│ - Reads host token from getHostToken(roundId) (already exists in src/lib/host-token.ts)                          │
│ - Cleans up interval on unmount                                                                                  │
│                                                                                                                  │
│ Host pages — add useHostHeartbeat(roundId) to:                                                                   │
│ - src/app/host/[roundId]/lobby/page.tsx                                                                          │
│ - src/app/host/[roundId]/processing/page.tsx                                                                     │
│ - src/app/host/[roundId]/reveal/page.tsx                                                                         │
│                                                                                                                  │
│ 2. Public rounds API update                                                                                      │
│                                                                                                                  │
│ src/app/api/rounds/public/route.ts                                                                               │
│ - Expand status filter: ['setup', 'ranking', 'revealed'] (add revealed for completed rounds)                     │
│ - Add host_heartbeat_at to select columns                                                                        │
│ - Return new field host_active: boolean (true if host_heartbeat_at is within last 60 seconds)                    │
│ - For revealed rounds, also return id so the join page can link to /results/{id}                                 │
│                                                                                                                  │
│ 3. Join page UI update                                                                                           │
│                                                                                                                  │
│ src/app/join/page.tsx                                                                                            │
│                                                                                                                  │
│ Badge states:                                                                                                    │
│ ┌──────────────┬─────────────┬──────────────────┬─────────┬──────────────────────────────────┐                   │
│ │ Round status │ Host active │      Badge       │ Variant │          Click behavior          │                   │
│ ├──────────────┼─────────────┼──────────────────┼─────────┼──────────────────────────────────┤                   │
│ │ setup        │ yes         │ "Open"           │ info    │ Fills join code                  │                   │
│ ├──────────────┼─────────────┼──────────────────┼─────────┼──────────────────────────────────┤                   │
│ │ setup        │ no          │ Hidden from list │ —       │ —                                │                   │
│ ├──────────────┼─────────────┼──────────────────┼─────────┼──────────────────────────────────┤                   │
│ │ ranking      │ any         │ "Voting"         │ warning │ Fills join code (still joinable) │                   │
│ ├──────────────┼─────────────┼──────────────────┼─────────┼──────────────────────────────────┤                   │
│ │ revealed     │ any         │ "Completed"      │ success │ Links to /results/{id}           │                   │
│ └──────────────┴─────────────┴──────────────────┴─────────┴──────────────────────────────────┘                   │
│ - setup rounds without an active host are filtered out client-side (don't clutter the list)                      │
│ - Completed rounds open /results/{id} in the same tab via router.push instead of filling the code                │
│ - Card for completed rounds shows "View results" instead of the join code                                        │
│                                                                                                                  │
│ Files                                                                                                            │
│                                                                                                                  │
│ New files (3):                                                                                                   │
│ - supabase/migrations/add_host_heartbeat.sql                                                                     │
│ - src/app/api/rounds/[roundId]/heartbeat/route.ts                                                                │
│ - src/lib/useHostHeartbeat.ts                                                                                    │
│                                                                                                                  │
│ Modified files (6):                                                                                              │
│ - supabase/schema.sql                                                                                            │
│ - src/types/database.ts                                                                                          │
│ - src/app/api/rounds/public/route.ts                                                                             │
│ - src/app/join/page.tsx                                                                                          │
│ - src/app/host/[roundId]/lobby/page.tsx                                                                          │
│ - src/app/host/[roundId]/processing/page.tsx                                                                     │
│ - src/app/host/[roundId]/reveal/page.tsx                                                                         │
│                                                                                                                  │
│ Verification                                                                                                     │
│                                                                                                                  │
│ 1. npm run build — clean                                                                                         │
│ 2. npm test — pass                                                                                               │
│ 3. Manual checks:                                                                                                │
│   - Open host lobby → heartbeat PATCH calls visible in network tab every 30s                                     │
│   - Close host tab → after 60s, round no longer shows as "Open" on /join                                         │
│   - Create round, start ranking → shows as "Voting" on /join regardless of host tab                              │
│   - Complete a round → shows as "Completed" on /join, clicking opens results page                                │
│   - setup round with no host present → not shown in public list                                                  │
╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

● I'll implement this plan step by step. Let me start by reading all the files I need to modify.

● Read 8 files (ctrl+o to expand)

● Now let me check an existing host-authenticated API route to match the pattern.

● Searched for 3 patterns, read 2 files (ctrl+o to expand)

● Good, I have full context. Let me now check the existing migrations folder structure and then implement
  everything.

● Searched for 1 pattern (ctrl+o to expand)

● Now I'll implement all the changes. Let me start with the new files and schema updates.

● Write(supabase/migrations/add_host_heartbeat.sql)
  ⎿  Wrote 3 lines to supabase/migrations/add_host_heartbeat.sql
      1 -- Add host heartbeat timestamp for presence tracking
      2 ALTER TABLE rounds ADD COLUMN IF NOT EXISTS host_heartbeat_at timestamptz;

● Write(src/app/api/rounds/[roundId]/heartbeat/route.ts)
  ⎿  Wrote 29 lines to src/app/api/rounds/[roundId]/heartbeat/route.ts
      1 import { NextResponse } from 'next/server'
      2 import { createClient } from '@/lib/supabase/server'
      3
      4 export async function PATCH(
      5   request: Request,
      6   { params }: { params: Promise<{ roundId: string }> }
      7 ) {
      8   const { roundId } = await params
      9   const hostToken = request.headers.get('X-Host-Token')
     … +19 lines (ctrl+o to expand)

● Write(src/lib/useHostHeartbeat.ts)
  ⎿  Wrote 25 lines to src/lib/useHostHeartbeat.ts
       1 'use client'
       2
       3 import { useEffect } from 'react'
       4 import { getHostToken } from '@/lib/host-token'
       5
       6 const HEARTBEAT_INTERVAL = 30_000 // 30 seconds
       7
       8 export function useHostHeartbeat(roundId: string) {
       9   useEffect(() => {
      10     const hostToken = getHostToken(roundId)
     … +15 lines (ctrl+o to expand)

● Now update the schema, types, and the existing files.

● Update(supabase/schema.sql)
  ⎿  Added 1 line
      17    previous_round_id uuid references rounds(id) on delete set null,
      18    next_round_id uuid references rounds(id) on delete set null,
      19    is_private boolean not null default false,
      20 +  host_heartbeat_at timestamptz,
      21    created_at timestamptz not null default now()
      22  );
      23

● Update(src/types/database.ts)
  ⎿  Added 1 line
      28    previous_round_id: string | null
      29    next_round_id: string | null
      30    is_private: boolean
      31 +  host_heartbeat_at: string | null
      32    created_at: string
      33  }
      34

● Update(src/app/api/rounds/public/route.ts)
  ⎿  Added 2 lines, removed 2 lines
       6
       7    const { data: rounds, error } = await supabase
       8      .from('rounds')
       9 -    .select('id, join_code, prompt, status, options, created_at')
       9 +    .select('id, join_code, prompt, status, options, host_heartbeat_at, created_at')
      10      .eq('is_private', false)
      11 -    .in('status', ['setup', 'ranking'])
      11 +    .in('status', ['setup', 'ranking', 'revealed'])
      12      .order('created_at', { ascending: false })
      13      .limit(20)
      14

● Update(src/app/api/rounds/public/route.ts)
  ⎿  Added 6 lines
      34      }
      35    }
      36
      37 +  const now = Date.now()
      38 +  const HOST_ACTIVE_THRESHOLD = 60_000 // 60 seconds
      39 +
      40    const result = rounds.map(r => ({
      41      id: r.id,
      42      join_code: r.join_code,
     ...
      44      status: r.status,
      45      options_count: Array.isArray(r.options) ? r.options.length : 0,
      46      participant_count: countsByRound[r.id] || 0,
      47 +    host_active: r.host_heartbeat_at
      48 +      ? now - new Date(r.host_heartbeat_at).getTime() < HOST_ACTIVE_THRESHOLD
      49 +      : false,
      50      created_at: r.created_at,
      51    }))
      52

● Now update the join page with the new badge logic and completed round handling.

● Update(src/app/join/page.tsx)
  ⎿  Added 1 line
      16    status: string
      17    options_count: number
      18    participant_count: number
      19 +  host_active: boolean
      20    created_at: string
      21  }
      22

● Now update the public rounds list rendering with the new badge states and click behavior.

● Update(src/app/join/page.tsx)
  ⎿  Added 51 lines, removed 30 lines
      133
      134          {loadingRounds ? (
      135            <p className="text-sm text-gray-400 text-center">Loading open rounds...</p>
      136 -        ) : publicRounds.length > 0 && (
      137 -          <div className="space-y-3">
      138 -            <h2 className="text-sm font-medium text-gray-700">Open rounds</h2>
      139 -            <div className="space-y-2">
      140 -              {publicRounds.map(round => (
      141 -                <button
      142 -                  key={round.id}
      143 -                  type="button"
      144 -                  onClick={() => setCode(round.join_code)}
      145 -                  className={`w-full text-left rounded-xl border p-3 transition-colors hover:bg-gr
          -ay-50 cursor-pointer ${
      146 -                    code === round.join_code
      147 -                      ? 'border-indigo-500 bg-indigo-50/50'
      148 -                      : 'border-gray-200 bg-white'
      149 -                  }`}
      150 -                >
      151 -                  <div className="flex items-start justify-between gap-2">
      152 -                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{round.prompt}</
          -p>
      153 -                    <Badge variant={round.status === 'ranking' ? 'success' : 'info'}>
      154 -                      {round.status === 'ranking' ? 'Ranking' : 'Open'}
      155 -                    </Badge>
      156 -                  </div>
      157 -                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
      158 -                    <span className="font-mono">{round.join_code}</span>
      159 -                    <span>{round.options_count} options</span>
      160 -                    <span>{round.participant_count} joined</span>
      161 -                  </div>
      162 -                </button>
      163 -              ))}
      136 +        ) : (() => {
      137 +          const visibleRounds = publicRounds.filter(
      138 +            r => !(r.status === 'setup' && !r.host_active)
      139 +          )
      140 +          return visibleRounds.length > 0 && (
      141 +            <div className="space-y-3">
      142 +              <h2 className="text-sm font-medium text-gray-700">Public rounds</h2>
      143 +              <div className="space-y-2">
      144 +                {visibleRounds.map(round => {
      145 +                  const isCompleted = round.status === 'revealed'
      146 +                  const badge = round.status === 'ranking'
      147 +                    ? <Badge variant="warning">Voting</Badge>
      148 +                    : isCompleted
      149 +                      ? <Badge variant="success">Completed</Badge>
      150 +                      : <Badge variant="info">Open</Badge>
      151 +
      152 +                  return (
      153 +                    <button
      154 +                      key={round.id}
      155 +                      type="button"
      156 +                      onClick={() => {
      157 +                        if (isCompleted) {
      158 +                          router.push(`/results/${round.id}`)
      159 +                        } else {
      160 +                          setCode(round.join_code)
      161 +                        }
      162 +                      }}
      163 +                      className={`w-full text-left rounded-xl border p-3 transition-colors hover:b
          +g-gray-50 cursor-pointer ${
      164 +                        !isCompleted && code === round.join_code
      165 +                          ? 'border-indigo-500 bg-indigo-50/50'
      166 +                          : 'border-gray-200 bg-white'
      167 +                      }`}
      168 +                    >
      169 +                      <div className="flex items-start justify-between gap-2">
      170 +                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{round.promp
          +t}</p>
      171 +                        {badge}
      172 +                      </div>
      173 +                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
      174 +                        {isCompleted
      175 +                          ? <span className="text-indigo-600 font-medium">View results</span>
      176 +                          : <span className="font-mono">{round.join_code}</span>
      177 +                        }
      178 +                        <span>{round.options_count} options</span>
      179 +                        <span>{round.participant_count} joined</span>
      180 +                      </div>
      181 +                    </button>
      182 +                  )
      183 +                })}
      184 +              </div>
      185              </div>
      165 -          </div>
      166 -        )}
      186 +          )
      187 +        })()}
      188        </div>
      189      </main>
      190    )

● Now add the heartbeat hook to the three host pages.

● Update(src/app/host/[roundId]/lobby/page.tsx)
  ⎿  Added 1 line
      13  import CountdownTimer, { computeDeadline } from '@/components/CountdownTimer'
      14  import { getHostToken, getHostHeaders, saveParticipantId, getParticipantId } from '@/lib/host-token
          '
      15  import { subscribeToRound, subscribeToParticipants, subscribeToRankings } from '@/lib/realtime'
      16 +import { useHostHeartbeat } from '@/lib/useHostHeartbeat'
      17
      18  interface RoundData {
      19    id: string


● Update(src/app/host/[roundId]/lobby/page.tsx)
  ⎿  Added 2 lines
      48
      49    const hostToken = typeof window !== 'undefined' ? getHostToken(roundId) : null
      50
      51 +  useHostHeartbeat(roundId)
      52 +
      53    useEffect(() => {
      54      async function init() {
      55        const [roundRes, playersRes] = await Promise.allSettled([

● Update(src/app/host/[roundId]/processing/page.tsx)
  ⎿  Added 3 lines
       2
       3  import { useParams } from 'next/navigation'
       4  import ProcessingView from '@/components/ProcessingView'
       5 +import { useHostHeartbeat } from '@/lib/useHostHeartbeat'
       6
       7  export default function HostProcessingPage() {
       8    const params = useParams()
       9    const roundId = params.roundId as string
      10
      11 +  useHostHeartbeat(roundId)
      12 +
      13    return (
      14      <ProcessingView
      15        roundId={roundId}

● Update(src/app/host/[roundId]/reveal/page.tsx)
  ⎿  Added 1 line
      11  import SelectionGridView from '@/components/reveal/SelectionGridView'
      12  import FullResultsTableView from '@/components/reveal/FullResultsTableView'
      13  import { saveHostToken, getHostToken } from '@/lib/host-token'
      14 +import { useHostHeartbeat } from '@/lib/useHostHeartbeat'
      15  import { RoundData as EliminationRound } from '@/types/database'
      16  import type { RevealViewType, RevealViewState } from '@/types/database'
      17  import type { ConvergeResult } from '@/lib/engine/types'

● Update(src/app/host/[roundId]/reveal/page.tsx)
  ⎿  Added 2 lines
      52    const [replayLoading, setReplayLoading] = useState(false)
      53    const [replayError, setReplayError] = useState('')
      54
      55 +  useHostHeartbeat(roundId)
      56 +
      57    const shareUrl = result?.share_url || `${typeof window !== 'undefined' ? window.location.origin :
           ''}/results/${roundId}`
      58
      59    const handleCopyShareUrl = async () => {

● All edits are in place. Let me verify the build is clean.

● Bash(npm run build 2>&1)
  ⎿  > morethanone@0.0.1 build
     > next build
     … +39 lines (ctrl+o to expand)
  ⎿  (timeout 2m)

● Build is clean. Let me run tests as well.

● Bash(npm test 2>&1)
  ⎿  > morethanone@0.0.1 test
     > jest
     … +18 lines (ctrl+o to expand)
  ⎿  (timeout 1m)

● All 28 test suites pass (346 tests). Here's a summary of everything implemented:

  New files (3):
  - supabase/migrations/add_host_heartbeat.sql — migration adding host_heartbeat_at column
  - src/app/api/rounds/[roundId]/heartbeat/route.ts — PATCH endpoint that updates the heartbeat timestamp
  (authenticated via X-Host-Token)
  - src/lib/useHostHeartbeat.ts — custom hook that sends heartbeat on mount + every 30s

  Modified files (7):
  - supabase/schema.sql — added host_heartbeat_at timestamptz column
  - src/types/database.ts — added host_heartbeat_at: string | null to Round interface
  - src/app/api/rounds/public/route.ts — now fetches revealed rounds too, includes host_heartbeat_at, returns
  computed host_active boolean (true if heartbeat within 60s)
  - src/app/join/page.tsx — new badge logic: "Open" (setup + host active), "Voting" (ranking), "Completed" (revealed
   → links to results). Setup rounds without active host are hidden.
  - src/app/host/[roundId]/lobby/page.tsx — added useHostHeartbeat(roundId)
  - src/app/host/[roundId]/processing/page.tsx — added useHostHeartbeat(roundId)
  - src/app/host/[roundId]/reveal/page.tsx — added useHostHeartbeat(roundId)

✻ Churned for 1m 49s