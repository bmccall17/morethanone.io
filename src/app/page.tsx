import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            morethanone
          </h1>
          <p className="text-lg text-gray-500">
            Group decisions, one choice at a time.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/host/create"
            className="block w-full rounded-lg bg-indigo-600 text-white px-6 py-3 text-lg font-medium hover:bg-indigo-700 transition-colors text-center"
          >
            Host a round
          </Link>
          <Link
            href="/join"
            className="block w-full rounded-lg bg-white text-gray-900 border border-gray-300 px-6 py-3 text-lg font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Join a round
          </Link>
        </div>

        <Link
          href="/demo"
          className="inline-block text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          See how it works &rarr;
        </Link>

        <p className="text-xs text-gray-400">
          Rank your options. Watch them converge.
        </p>
      </div>
    </main>
  )
}
