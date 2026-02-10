export interface DemoScenario {
  name: string
  description: string
  options: string[]
  ballots: string[][]
  participants: string[]
  teachableMoment: string
}

/**
 * Scenario 1: Early Leader, Late Overtake
 *
 * A leads strongly in first preferences (6/15).
 * C and D are broadly liked but rarely first.
 * E eliminated first → splits to C/D.
 * B eliminated next → heavy tilt to C.
 * C overtakes A in later rounds.
 */
const earlyLeaderLateOvertake: DemoScenario = {
  name: 'Early Leader, Late Overtake',
  description: 'Option A leads strongly in first preferences, but broad second-choice support for C shifts the outcome.',
  options: ['A', 'B', 'C', 'D', 'E'],
  participants: [
    'Alex', 'Blake', 'Casey', 'Dana', 'Ellis',
    'Frankie', 'Gray', 'Harper', 'Indigo', 'Jordan',
    'Kit', 'Lane', 'Morgan', 'Nico', 'Parker',
  ],
  ballots: [
    // A-first voters (6) — second prefs split, some go to D
    ['A', 'D', 'B', 'C', 'E'],
    ['A', 'D', 'C', 'B', 'E'],
    ['A', 'B', 'D', 'C', 'E'],
    ['A', 'D', 'B', 'E', 'C'],
    ['A', 'B', 'D', 'E', 'C'],
    ['A', 'D', 'C', 'E', 'B'],
    // B-first voters (3) — second prefs mostly C
    ['B', 'C', 'A', 'D', 'E'],
    ['B', 'C', 'D', 'A', 'E'],
    ['B', 'C', 'A', 'E', 'D'],
    // C-first voters (2) — modest first support
    ['C', 'B', 'D', 'A', 'E'],
    ['C', 'D', 'B', 'A', 'E'],
    // D-first voters (2)
    ['D', 'C', 'B', 'A', 'E'],
    ['D', 'C', 'A', 'B', 'E'],
    // E-first voters (2) — redistribute to C and D
    ['E', 'C', 'D', 'A', 'B'],
    ['E', 'D', 'C', 'B', 'A'],
  ],
  teachableMoment: 'Shows how broad, consistent second preferences can outweigh early dominance. A had the most first-choice votes but lacked depth of support across the group.',
}

/**
 * Scenario 2: Polarizing Favorite vs Steady Consensus
 *
 * A has most first preferences (5/12) but is rarely ranked beyond that.
 * B and C commonly ranked 2nd and 3rd.
 * D eliminated first → redistributes to B and C.
 * C eliminated next → majority flows to B.
 * B surpasses A.
 */
const polarizingVsConsensus: DemoScenario = {
  name: 'Polarizing Favorite vs Steady Consensus',
  description: 'Option A has the most first-choice votes but is rarely anyone\'s second choice. B steadily gathers support.',
  options: ['A', 'B', 'C', 'D'],
  participants: [
    'Riley', 'Sage', 'Taylor', 'Uma', 'Val',
    'Wren', 'Xen', 'Yael', 'Zion', 'Ash',
    'Briar', 'Cypress',
  ],
  ballots: [
    // A-first voters (5) — polarizing, rarely rank B high
    ['A', 'D', 'C', 'B'],
    ['A', 'D', 'C', 'B'],
    ['A', 'C', 'D', 'B'],
    ['A', 'D', 'B', 'C'],
    ['A', 'C', 'D', 'B'],
    // B-first voters (3) — consensus builder
    ['B', 'C', 'A', 'D'],
    ['B', 'C', 'D', 'A'],
    ['B', 'D', 'C', 'A'],
    // C-first voters (3) — second pref is B
    ['C', 'B', 'D', 'A'],
    ['C', 'B', 'A', 'D'],
    ['C', 'B', 'D', 'A'],
    // D-first voter (1) — redistributes to B
    ['D', 'B', 'C', 'A'],
  ],
  teachableMoment: 'Demonstrates how a polarizing option can lose to a consensus-friendly one. A was the most popular first choice, but B was broadly acceptable and gathered support from every direction.',
}

/**
 * Scenario 3: Comeback from Third Position
 *
 * A and B trade the lead early.
 * C starts third with modest firsts but appears frequently in top-3.
 * F and E eliminated first → flow disproportionately to C.
 * D eliminated next → again strengthens C.
 * C overtakes both A and B.
 */
const comebackFromThird: DemoScenario = {
  name: 'Comeback from Third Position',
  description: 'C starts in third place but appears in nearly everyone\'s top three. Layered preferences propel C to victory.',
  options: ['A', 'B', 'C', 'D', 'E', 'F'],
  participants: [
    'Avery', 'Brook', 'Charlie', 'Drew', 'Emery', 'Finley',
    'Glenn', 'Hadley', 'Ira', 'Jules', 'Kai', 'Lark',
    'Marlow', 'Noel', 'Oakley', 'Phoenix', 'Quinn', 'Reese',
  ],
  ballots: [
    // A-first voters (5) — some have C in second
    ['A', 'C', 'B', 'D', 'E', 'F'],
    ['A', 'B', 'C', 'D', 'E', 'F'],
    ['A', 'C', 'D', 'B', 'E', 'F'],
    ['A', 'B', 'D', 'C', 'E', 'F'],
    ['A', 'D', 'C', 'B', 'E', 'F'],
    // B-first voters (5) — some have C in second
    ['B', 'C', 'A', 'D', 'E', 'F'],
    ['B', 'A', 'C', 'D', 'E', 'F'],
    ['B', 'C', 'D', 'A', 'E', 'F'],
    ['B', 'A', 'D', 'C', 'E', 'F'],
    ['B', 'C', 'A', 'D', 'E', 'F'],
    // C-first voters (3) — modest first support
    ['C', 'A', 'B', 'D', 'E', 'F'],
    ['C', 'B', 'A', 'D', 'E', 'F'],
    ['C', 'D', 'A', 'B', 'E', 'F'],
    // D-first voters (2) — redistribute to C
    ['D', 'C', 'A', 'B', 'E', 'F'],
    ['D', 'C', 'B', 'A', 'E', 'F'],
    // E-first voters (2) — redistribute to C
    ['E', 'C', 'D', 'A', 'B', 'F'],
    ['E', 'C', 'A', 'B', 'D', 'F'],
    // F-first voter (1) — redistributes to C
    ['F', 'C', 'D', 'A', 'B', 'E'],
  ],
  teachableMoment: 'Highlights how layered preferences matter more than top-line position. C was rarely anyone\'s first choice, but was nearly everyone\'s second or third — making it the true consensus.',
}

export const scenarios: DemoScenario[] = [
  earlyLeaderLateOvertake,
  polarizingVsConsensus,
  comebackFromThird,
]
