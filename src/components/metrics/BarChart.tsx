interface BarChartProps {
  data: { label: string; value: number }[]
  maxValue?: number
}

export default function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-24 text-right shrink-0">{item.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max((item.value / max) * 100, 0)}%` }}
            />
          </div>
          <span className="text-sm font-mono text-gray-700 w-12 shrink-0">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
