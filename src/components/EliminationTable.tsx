import { RoundData } from '@/types/database'

interface EliminationTableProps {
  rounds: RoundData[]
}

export default function EliminationTable({ rounds }: EliminationTableProps) {
  // Collect all unique options across all rounds
  const allOptions = new Set<string>()
  for (const round of rounds) {
    for (const option of Object.keys(round.tallies)) {
      allOptions.add(option)
    }
  }
  const options = [...allOptions]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 text-gray-500 font-medium">Round</th>
            {options.map(opt => (
              <th key={opt} className="text-center py-2 px-2 text-gray-500 font-medium">
                {opt}
              </th>
            ))}
            <th className="text-left py-2 pl-4 text-gray-500 font-medium">Eliminated</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map(round => (
            <tr key={round.round_number} className="border-b border-gray-100">
              <td className="py-2 pr-4 text-gray-600 font-mono">{round.round_number}</td>
              {options.map(opt => {
                const count = round.tallies[opt]
                const isEliminated = round.eliminated === opt
                return (
                  <td
                    key={opt}
                    className={`text-center py-2 px-2 font-mono ${
                      count === undefined
                        ? 'text-gray-300'
                        : isEliminated
                          ? 'text-red-500 line-through'
                          : 'text-gray-900'
                    }`}
                  >
                    {count !== undefined ? count : '-'}
                  </td>
                )
              })}
              <td className="py-2 pl-4 text-red-500 text-xs">
                {round.eliminated || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
