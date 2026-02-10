'use client'

interface SelectionGridViewProps {
  ballots: { displayName: string; ranking: string[] }[]
  options: string[]
}

export default function SelectionGridView({ ballots, options }: SelectionGridViewProps) {
  // Determine max rank depth across all ballots
  const maxRank = Math.max(...ballots.map(b => b.ranking.length), 1)
  const rankLabels = Array.from({ length: maxRank }, (_, i) => {
    const n = i + 1
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
  })

  return (
    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">Voter</th>
            {rankLabels.map(label => (
              <th key={label} className="text-center py-2 px-3 text-sm font-bold text-orange-400">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ballots.map((ballot, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-800">
              <td className="py-3 pr-3 text-xs text-gray-400 whitespace-nowrap">
                {ballot.displayName}
              </td>
              {rankLabels.map((_, colIndex) => {
                const rankedOption = ballot.ranking[colIndex]
                const hasPick = rankedOption !== undefined && options.includes(rankedOption)
                return (
                  <td key={colIndex} className="text-center py-3 px-3">
                    <div className="flex items-center justify-center">
                      {hasPick ? (
                        <div
                          className="w-7 h-7 rounded-full bg-orange-400"
                          title={rankedOption}
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-orange-400/40" />
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
