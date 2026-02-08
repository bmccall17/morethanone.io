import Card from '@/components/ui/Card'

interface ResultSummaryProps {
  text: string
}

export default function ResultSummary({ text }: ResultSummaryProps) {
  return (
    <Card>
      <p className="text-gray-700 leading-relaxed">{text}</p>
    </Card>
  )
}
