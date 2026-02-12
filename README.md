# morethanone

morethanone is a social decision tool for groups. A host creates a round, players rank the options in order of preference, and the system processes those rankings down to a single group choice. The result tends to reflect the broadest overlap in the room, the option that the most people can genuinely get behind.

It lives at [morethanone.io](https://morethanone.io).

## why this exists

When a group of people tries to choose one thing (where to eat, what to prioritize, which name to pick), the usual approach is "everybody pick your favorite." That works when there's a clear frontrunner. It falls apart when preferences are spread across several decent options. People split, the loudest voice wins, or the group just goes with whatever somebody suggests first. The actual collective preference stays hidden.

Ranked choice is the well-studied solution to this problem. Each person ranks the options. The system eliminates the least-supported option each round and redistributes that support to each person's next preference, repeating until one option earns majority support. The math is clean. The outcomes are fair. And the method has decades of research behind it.

The trouble is that ranked choice voting has become a political lightning rod. It is one of the most promising structural reforms in modern democracy, and the backlash against it has been driven almost entirely by partisan framing. People who would benefit enormously from RCV in their communities, workplaces, and friend groups never try it because the phrase itself has been poisoned by cable news cycles and campaign attack ads. The method got tangled up in the politics it was meant to improve.

morethanone takes the same proven math and puts it in a context where people can experience it directly: choosing a restaurant, picking a team name, deciding what game to play. When you watch your group converge on a choice through rounds of elimination and redistribution, you understand intuitively why the result feels right. That understanding transfers. The goal is to let people discover the power of expressive preference ranking on their own terms, in low-stakes moments that build genuine intuition.

## how it works

A host creates a round by entering a prompt and a set of options. The system generates a short join code and QR code. Players join on their phones, enter a display name (or generate a fun random one), and rank the options by dragging them into their preferred order. When the host closes ranking, processing begins.

The engine counts everyone's current top choice. If any option holds more than half of the active support, it becomes the group choice. Otherwise, the option with the fewest supporters is eliminated, and those supporters' rankings cascade to their next available preference. This repeats until one option crosses the majority threshold or stands alone.

The reveal shows the group how their choice emerged: round by round, with counts, eliminations, and transfers. A plain-language summary explains the outcome in two or three sentences. The host can switch between an animated bar chart view, a selection grid showing how each participant ranked, and a full results table with round-by-round data.

## who it's for

Facilitators running workshops, classrooms, retreats, and meetups. Friend groups deciding where to eat, what to watch, or what to do this weekend. Teams choosing between several reasonable options for a name, a priority, a theme. Anyone in a room (physical or virtual) with a group of people and a decision to make.

A typical session involves five to forty people, three to twelve options, and one to five minutes of ranking.

## what's in the box

The host has a full set of controls: create rounds with custom options or start from a template (Games You Love, Best Movie, Team Lunch), toggle anonymous mode, set a ranking timer, limit how many options each player can rank, participate alongside players, show live processing transparency, remove players or options during setup, and replay rounds with one click. A profanity filter covers display names and option text. A 3-2-1 countdown builds shared attention before the reveal.

Players get a clean drag-and-drop ranking interface with sound feedback and haptic vibration on mobile. Submitting locks in your ranking. When the host reveals results, everyone watches the same animated sequence together.

The processing engine is deterministic and fully tested. Tie-breaking uses a three-tier system: next-preference strength, then total mentions, then a seeded SHA-256 coin flip with transparency. Same input always produces the same output.

A built-in demo mode lets hosts walk through three pre-scripted scenarios step by step, with optional plain-language explanations at each round. This is useful for teaching the process to a new audience before running a live session.

An admin metrics dashboard tracks completion rates, convergence speed, tie-break frequency, and recent round activity.

## tech stack

The app is built with Next.js 16 (app router), TypeScript, React 19, and Tailwind CSS v4. The backend uses Supabase for Postgres storage and realtime subscriptions. Drag-and-drop ranking uses @dnd-kit. QR codes are generated with the qrcode library. Analytics run through Vercel Analytics and a custom events table. Deployment targets Vercel.

## running locally

You'll need Node.js and a Supabase project. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL and anon key. Run the schema from `supabase/schema.sql` in your Supabase SQL editor, then apply any migrations in `supabase/migrations/`. Install dependencies and start the dev server:

```
npm install
npm run dev
```

Tests run with Jest:

```
npm test
```

## current state

The project is at v0.0.8 across eight releases. The full host-to-player loop works end to end with realtime updates, animated reveals, host moderation, analytics, and replay support. The PRD's v1 scope is substantially complete. Remaining v1 items include a shareable result card image export and cross-device touch testing on iOS Safari and Android Chrome.

## where it's headed

The longer-term vision extends in a few directions. Integration with Pol.is would allow hosts to populate round options from real public opinion data, connecting the tool to existing civic discourse infrastructure. A post-round "felt fair?" pulse would capture participant sentiment and feed back into quality metrics. Deeper facilitation features (structured discussion-then-revote flows, multi-round tournaments, live option addition) would serve professional facilitators. And the parking lot holds ideas around accounts and persistence, Slack and Zoom integrations, data export, and visual polish like dark mode and celebration animations.

The underlying bet is simple: ranked preference systems produce better group outcomes, and the best way to build public understanding of that fact is to let people use one in the wild, in moments that matter to them, over and over again.

## license

This project is not currently open-source. All rights reserved.
