import Card from '@/components/ui/Card'

interface StatCardProps {
  label: string
  value: string | number
  detail?: string
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
    </Card>
  )
}
