'use client'

import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import { getHostHeaders } from '@/lib/host-token'

interface Player {
  id: string
  display_name: string
}

interface PlayerListProps {
  players: Player[]
  roundId?: string
  isHost?: boolean
  roundStatus?: string
}

export default function PlayerList({ players, roundId, isHost, roundStatus }: PlayerListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)

  const showRemoveButton = isHost && roundId && (roundStatus === 'setup' || roundStatus === 'ranking')

  async function handleRemove(playerId: string) {
    if (!roundId) return
    setRemovingId(playerId)
    try {
      const res = await fetch(`/api/rounds/${roundId}/participants/${playerId}/remove`, {
        method: 'POST',
        headers: getHostHeaders(roundId),
      })
      if (!res.ok) {
        const data = await res.json()
        console.error('Failed to remove participant:', data.error)
      }
    } catch (err) {
      console.error('Failed to remove participant:', err)
    } finally {
      setRemovingId(null)
    }
  }

  if (players.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-4">
        Waiting for players to join...
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Players</h3>
        <Badge variant="info">{players.length} joined</Badge>
      </div>
      <ul className="space-y-1">
        {players.map(player => (
          <li
            key={player.id}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-100"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-gray-900 flex-1">{player.display_name}</span>
            {showRemoveButton && (
              <button
                onClick={() => handleRemove(player.id)}
                disabled={removingId === player.id}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {removingId === player.id ? 'Removing...' : 'Remove'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
