import Card from '@/components/ui/Card'

interface WinnerCardProps {
  winner: string
  percentage: number
  totalRounds: number
}

export default function WinnerCard({ winner, percentage, totalRounds }: WinnerCardProps) {
  return (
    <Card className="text-center" padding="lg">
      <p className="text-sm text-gray-500 mb-1">The group has chosen</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{winner}</h2>
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
        <span>{percentage}% of the vote</span>
        <span className="text-gray-300">|</span>
        <span>{totalRounds} round{totalRounds !== 1 ? 's' : ''}</span>
      </div>
    </Card>
  )
}
