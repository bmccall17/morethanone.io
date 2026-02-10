'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Toggle from '@/components/ui/Toggle'
import DemoTallyView from '@/components/demo/DemoTallyView'
import MockParticipantCard from '@/components/demo/MockParticipantCard'
import { DemoRunner } from '@/lib/demo/engine'
import { scenarios } from '@/lib/demo/scenarios'

export default function DemoPage() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [showExplanations, setShowExplanations] = useState(false)

  const scenario = scenarios[scenarioIndex]

  const runner = useMemo(() => new DemoRunner(scenario), [scenario])

  const totalRounds = runner.totalRounds()
  const explanation = showExplanations ? runner.getExplanation(roundNumber) : ''
  const roundsUpToCurrent = runner.getRound(roundNumber)

  function handleScenarioChange(index: number) {
    setScenarioIndex(index)
    setRoundNumber(1)
  }

  function handlePrev() {
    setRoundNumber(r => Math.max(1, r - 1))
  }

  function handleNext() {
    setRoundNumber(r => Math.min(totalRounds, r + 1))
  }

  // Pick a subset of participants for the card grid (up to 8)
  const displayParticipants = useMemo(() => {
    const count = Math.min(scenario.participants.length, 8)
    // Spread evenly through the ballot set for visual variety
    const step = scenario.participants.length / count
    const indices: number[] = []
    for (let i = 0; i < count; i++) {
      indices.push(Math.floor(i * step))
    }
    return indices.map(i => ({
      name: scenario.participants[i],
      ballot: scenario.ballots[i],
    }))
  }, [scenario])

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              &larr; Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Demo Mode
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Step through predefined scenarios to see how ranked-choice convergence works.
            </p>
          </div>
        </div>

        {/* Controls bar */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Scenario selector */}
            <div className="flex-1">
              <label htmlFor="scenario-select" className="text-xs font-medium text-gray-500 block mb-1">
                Scenario
              </label>
              <select
                id="scenario-select"
                value={scenarioIndex}
                onChange={e => handleScenarioChange(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {scenarios.map((s, i) => (
                  <option key={i} value={i}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Explanations toggle */}
            <div className="sm:w-56">
              <Toggle
                label="Show explanations"
                description="Plain-language narration"
                checked={showExplanations}
                onChange={setShowExplanations}
              />
            </div>
          </div>
        </Card>

        {/* Scenario description */}
        <p className="text-sm text-gray-600 px-1">{scenario.description}</p>

        {/* Main content: two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Host control panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <DemoTallyView result={runner.result} roundNumber={roundNumber} />
            </Card>

            {/* Step controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrev}
                disabled={roundNumber <= 1}
                className="flex-1"
              >
                &larr; Previous
              </Button>
              <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                {roundNumber} / {totalRounds}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNext}
                disabled={roundNumber >= totalRounds}
                className="flex-1"
              >
                Next &rarr;
              </Button>
            </div>

            {/* Explanation panel */}
            {showExplanations && explanation && (
              <Card padding="sm" className="bg-indigo-50 border-indigo-100">
                <p className="text-sm text-indigo-900 leading-relaxed">{explanation}</p>
              </Card>
            )}

            {/* Teachable moment — shown on final round */}
            {roundNumber === totalRounds && (
              <Card padding="sm" className="bg-amber-50 border-amber-100">
                <p className="text-xs font-medium text-amber-700 mb-1">Takeaway</p>
                <p className="text-sm text-amber-900 leading-relaxed">{scenario.teachableMoment}</p>
              </Card>
            )}
          </div>

          {/* Right: Mock participant grid */}
          <div className="lg:col-span-3">
            <p className="text-xs font-medium text-gray-500 mb-3">
              Participant perspectives ({scenario.ballots.length} voters, showing {displayParticipants.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayParticipants.map(p => (
                <MockParticipantCard
                  key={p.name}
                  name={p.name}
                  ballot={p.ballot}
                  roundNumber={roundNumber}
                  rounds={runner.result.rounds}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
