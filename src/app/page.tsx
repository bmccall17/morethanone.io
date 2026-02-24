import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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

        <div className="w-full space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            How it works
          </p>
          <Link href="/demo" className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors text-left">
            <span className="text-xl leading-none mt-0.5">🎯</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">Interactive Demo</p>
              <p className="text-xs text-gray-500 mt-0.5">Step through real scenarios and watch preferences converge.</p>
            </div>
          </Link>
          <Link href="/faq" className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors text-left">
            <span className="text-xl leading-none mt-0.5">💡</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">FAQ</p>
              <p className="text-xs text-gray-500 mt-0.5">How ranking works and why it leads to better group decisions.</p>
            </div>
          </Link>
          <Link href="/rcv-world" className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors text-left">
            <span className="text-xl leading-none mt-0.5">🌍</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">RCV in the Wild</p>
              <p className="text-xs text-gray-500 mt-0.5">Real elections decided by ranked choice — from Alaska to Australia.</p>
            </div>
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Rank your options. Watch them converge.
        </p>
      </div>
    </main>
  )
}
