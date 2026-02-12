# morethanone

morethanone is a social decision tool for groups. A host creates a round, players rank the options in order of preference, and the system processes those rankings down to a single group choice. The result tends to reflect the broadest overlap in the room, the option that the most people can genuinely get behind.

It lives at [morethanone.io](https://morethanone.io).

## why this exists

when a group of people tries to choose one thing (where to eat, what to prioritize, which name to pick), the usual approach is "everybody pick your favorite." that works when there's a clear frontrunner. however, it falls apart when preferences are spread across several decent options. people split, the loudest voice wins, or people change their vote to try and help one win over one other, or the group just goes with whatever somebody suggests first. the actual collective preference stays hidden.

ranked choice is the well-studied solution to this problem. each person ranks the options. the system eliminates the least-supported option each round and redistributes that support to each person's next preference, repeating until one option earns majority support. the math is clean. the outcomes are fair and the smartest version of the group mind. and the method has decades of research behind it.

the trouble is that ranked choice voting has become a political lightning rod. it is one of the most promising structural reforms in modern democracy, and the backlash against it has been driven almost entirely by partisan framing. people who would benefit enormously from RCV in their communities, workplaces, and friend groups never try it because the phrase itself has been poisoned by cable news cycles and campaign attack ads. the method got tangled up in the politics it was meant to improve.

morethanone takes the same proven math and puts it in a context where people can experience it directly: choosing a restaurant, picking a team name, deciding what game to play. when you watch your group converge on a choice through rounds of elimination and redistribution, you understand intuitively why the result feels right. that understanding transfers. the goal is to let people discover the power of expressive preference ranking on their own terms, in low-stakes moments that build genuine intuition.

## how it works

a host creates a round by entering a prompt and a set of options. the system generates a short join code and QR code. players join on their phones, enter a display name (or generate a fun random one), and rank the options by dragging them into their preferred order. When the host closes ranking, processing begins.

the engine counts everyone's current top choice. If any option holds more than half of the active support, it becomes the group choice. Otherwise, the option with the fewest supporters is eliminated, and those supporters' rankings cascade to their next available preference. this repeats until one option crosses the majority threshold or stands alone.

the reveal shows the group how their choice emerged: round by round, with counts, eliminations, and transfers. a plain-language summary explains the outcome in two or three sentences. the host can switch between an animated bar chart view, a selection grid showing how each participant ranked, and a full results table with round-by-round data.

## who it's for

facilitators running workshops, classrooms, retreats, and meetups. friend groups deciding where to eat, what to watch, or what to do this weekend. teams choosing between several reasonable options for a name, a priority, a theme. anyone in a room (physical or virtual) with a group of people and a decision to make.

a typical session involves five to forty people, three to twelve options, and one to five minutes of ranking.

## what's in the box

the host has a full set of controls: create rounds with custom options or start from a template (Games You Love, Best Movie, Team Lunch), toggle anonymous mode, set a ranking timer, limit how many options each player can rank, participate alongside players, show live processing transparency, remove players or options during setup, and replay rounds with one click. a profanity filter covers display names and option text. a 3-2-1 countdown builds shared attention before the reveal.

players get a clean drag-and-drop ranking interface with sound feedback and haptic vibration on mobile. submitting locks in your ranking. when the host reveals results, everyone watches the same animated sequence together.

the processing engine is deterministic and fully tested. tie-breaking uses a three-tier system: next-preference strength, then total mentions, then a seeded SHA-256 coin flip with transparency. same input always produces the same output.

a built-in demo mode lets hosts walk through three pre-scripted scenarios step by step, with optional plain-language explanations at each round. this is useful for teaching the process to a new audience before running a live session.

an admin metrics dashboard tracks completion rates, convergence speed, tie-break frequency, and recent round activity.

## tech stack

the app is built with Next.js 16 (app router), TypeScript, React 19, and Tailwind CSS v4. the backend uses Supabase for Postgres storage and realtime subscriptions. drag-and-drop ranking uses @dnd-kit. QR codes are generated with the qrcode library. analytics run through Vercel Analytics and a custom events table. deployment targets Vercel.

## running locally

you'll need Node.js and a Supabase project. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL and anon key. run the schema from `supabase/schema.sql` in your Supabase SQL editor, then apply any migrations in `supabase/migrations/`. install dependencies and start the dev server:

```
npm install
npm run dev
```

tests run with Jest:

```
npm test
```

## current state

the project is at v0.0.8 across eight releases. the full host-to-player loop works end to end with realtime updates, animated reveals, host moderation, analytics, and replay support. the PRD's v1 scope is substantially complete. remaining v1 items include a shareable result card image export and cross-device touch testing on iOS Safari and Android Chrome.

## where it's headed

the longer-term vision extends in a few directions. integration with Pol.is would allow hosts to populate round options from real public opinion data, connecting the tool to existing civic discourse infrastructure. a post-round "felt fair?" pulse would capture participant sentiment and feed back into quality metrics. deeper facilitation features (structured discussion-then-revote flows, multi-round tournaments, live option addition) would serve professional facilitators. and the parking lot holds ideas around accounts and persistence, Slack and Zoom integrations, data export, and visual polish like dark mode and celebration animations.

the underlying bet is simple: ranked preference systems produce better group outcomes, and the best way to build public understanding of that fact is to let people use one in the wild, in moments that matter to them, over and over again.

## license

this project is not currently open-source. all rights reserved.
