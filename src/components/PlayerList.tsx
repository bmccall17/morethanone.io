'use client'

import Badge from '@/components/ui/Badge'

interface Player {
  id: string
  display_name: string
}

interface PlayerListProps {
  players: Player[]
}

export default function PlayerList({ players }: PlayerListProps) {
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
            <span className="text-sm text-gray-900">{player.display_name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
