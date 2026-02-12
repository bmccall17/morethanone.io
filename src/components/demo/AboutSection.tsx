'use client'

import { useState } from 'react'

export default function AboutSection() {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold text-gray-900">About morethanone</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 border-t border-gray-100">
          <div className="prose prose-sm prose-gray max-w-none mt-4 space-y-6">
            <p className="text-gray-700 leading-relaxed">
              morethanone is a social decision tool for groups. A host creates a round, players rank the options in order of preference, and the system processes those rankings down to a single group choice. The result tends to reflect the broadest overlap in the room, the option that the most people can genuinely get behind.
            </p>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">why this exists</h3>
              <div className="space-y-3 text-gray-700 leading-relaxed text-sm">
                <p>
                  When a group of people tries to choose one thing (where to eat, what to prioritize, which name to pick), the usual approach is &ldquo;everybody pick your favorite.&rdquo; That works when there&rsquo;s a clear frontrunner. It falls apart when preferences are spread across several decent options. People split, the loudest voice wins, or the group just goes with whatever somebody suggests first. The actual collective preference stays hidden.
                </p>
                <p>
                  Ranked choice is the well-studied solution to this problem. Each person ranks the options. The system eliminates the least-supported option each round and redistributes that support to each person&rsquo;s next preference, repeating until one option earns majority support. The math is clean. The outcomes are fair. And the method has decades of research behind it.
                </p>
                <p>
                  The trouble is that ranked choice voting has become a political lightning rod. It is one of the most promising structural reforms in modern democracy, and the backlash against it has been driven almost entirely by partisan framing. People who would benefit enormously from RCV in their communities, workplaces, and friend groups never try it because the phrase itself has been poisoned by cable news cycles and campaign attack ads. The method got tangled up in the politics it was meant to improve.
                </p>
                <p>
                  morethanone takes the same proven math and puts it in a context where people can experience it directly: choosing a restaurant, picking a team name, deciding what game to play. When you watch your group converge on a choice through rounds of elimination and redistribution, you understand intuitively why the result feels right. That understanding transfers. The goal is to let people discover the power of expressive preference ranking on their own terms, in low-stakes moments that build genuine intuition.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">how it works</h3>
              <div className="space-y-3 text-gray-700 leading-relaxed text-sm">
                <p>
                  A host creates a round by entering a prompt and a set of options. The system generates a short join code and QR code. Players join on their phones, enter a display name (or generate a fun random one), and rank the options by dragging them into their preferred order. When the host closes ranking, processing begins.
                </p>
                <p>
                  The engine counts everyone&rsquo;s current top choice. If any option holds more than half of the active support, it becomes the group choice. Otherwise, the option with the fewest supporters is eliminated, and those supporters&rsquo; rankings cascade to their next available preference. This repeats until one option crosses the majority threshold or stands alone.
                </p>
                <p>
                  The reveal shows the group how their choice emerged: round by round, with counts, eliminations, and transfers. A plain-language summary explains the outcome in two or three sentences. The host can switch between an animated bar chart view, a selection grid showing how each participant ranked, and a full results table with round-by-round data.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">who it&rsquo;s for</h3>
              <div className="space-y-3 text-gray-700 leading-relaxed text-sm">
                <p>
                  Facilitators running workshops, classrooms, retreats, and meetups. Friend groups deciding where to eat, what to watch, or what to do this weekend. Teams choosing between several reasonable options for a name, a priority, a theme. Anyone in a room (physical or virtual) with a group of people and a decision to make.
                </p>
                <p>
                  A typical session involves five to forty people, three to twelve options, and one to five minutes of ranking.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">what&rsquo;s in the box</h3>
              <div className="space-y-3 text-gray-700 leading-relaxed text-sm">
                <p>
                  The host has a full set of controls: create rounds with custom options or start from a template (Games You Love, Best Movie, Team Lunch), toggle anonymous mode, set a ranking timer, limit how many options each player can rank, participate alongside players, show live processing transparency, remove players or options during setup, and replay rounds with one click. A profanity filter covers display names and option text. A 3-2-1 countdown builds shared attention before the reveal.
                </p>
                <p>
                  Players get a clean drag-and-drop ranking interface with sound feedback and haptic vibration on mobile. Submitting locks in your ranking. When the host reveals results, everyone watches the same animated sequence together.
                </p>
                <p>
                  The processing engine is deterministic and fully tested. Tie-breaking uses a three-tier system: next-preference strength, then total mentions, then a seeded SHA-256 coin flip with transparency. Same input always produces the same output.
                </p>
                <p>
                  A built-in demo mode lets hosts walk through three pre-scripted scenarios step by step, with optional plain-language explanations at each round. This is useful for teaching the process to a new audience before running a live session.
                </p>
                <p>
                  An admin metrics dashboard tracks completion rates, convergence speed, tie-break frequency, and recent round activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
