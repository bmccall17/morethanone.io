'use client'

interface SubmissionCounterProps {
  submitted: number
  total: number
}

export default function SubmissionCounter({ submitted, total }: SubmissionCounterProps) {
  const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">Rankings submitted</span>
        <span className="text-sm font-medium text-gray-900">
          {submitted} / {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
