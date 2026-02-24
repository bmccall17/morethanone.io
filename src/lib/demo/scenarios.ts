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
 * A leads strongly in first preferences (7/16).
 * C and D are broadly liked but rarely first.
 * E eliminated first → splits to C/D.
 * B eliminated next → heavy tilt to C.
 * C overtakes A in later rounds.
 * Some voters only rank 2–4 options (partial ballots).
 */
const earlyLeaderLateOvertake: DemoScenario = {
  name: 'Early Leader, Late Overtake',
  description: 'Option A leads strongly in first preferences, but broad second-choice support for C shifts the outcome.',
  options: ['A', 'B', 'C', 'D', 'E'],
  participants: [
    'Alex', 'Blake', 'Casey', 'Dana', 'Ellis',
    'Frankie', 'Gray', 'Harper', 'Indigo', 'Jordan',
    'Kit', 'Lane', 'Morgan', 'Nico', 'Parker', 'Quinn',
  ],
  ballots: [
    // A-first voters (7) — varying depth
    ['A', 'D', 'B', 'C', 'E'],
    ['A', 'D', 'C'],
    ['A', 'B', 'D', 'C', 'E'],
    ['A', 'D'],
    ['A', 'B', 'D', 'E', 'C'],
    ['A', 'D', 'C', 'E', 'B'],
    ['A', 'C', 'D'],
    // B-first voters (3) — second prefs mostly C
    ['B', 'C', 'A', 'D', 'E'],
    ['B', 'C', 'D'],
    ['B', 'C'],
    // C-first voters (2)
    ['C', 'B', 'D', 'A', 'E'],
    ['C', 'D', 'B'],
    // D-first voters (2)
    ['D', 'C', 'B', 'A', 'E'],
    ['D', 'C', 'A'],
    // E-first voters (2) — redistribute to C and D
    ['E', 'C', 'D', 'A', 'B'],
    ['E', 'D', 'C'],
  ],
  teachableMoment: 'Shows how broad, consistent second preferences can outweigh early dominance. A had the most first-choice votes but lacked depth of support across the group.',
}

/**
 * Scenario 2: Polarizing Favorite vs Steady Consensus
 *
 * A has most first preferences (6/16) but is rarely ranked beyond that.
 * B and C commonly ranked 2nd and 3rd.
 * D eliminated first → redistributes to B and C.
 * C eliminated next → majority flows to B.
 * B surpasses A.
 * Some voters rank only 2–3 options.
 */
const polarizingVsConsensus: DemoScenario = {
  name: 'Polarizing Favorite vs Steady Consensus',
  description: 'Option A has the most first-choice votes but is rarely anyone\'s second choice. B steadily gathers support.',
  options: ['A', 'B', 'C', 'D'],
  participants: [
    'Riley', 'Sage', 'Taylor', 'Uma', 'Val',
    'Wren', 'Xen', 'Yael', 'Zion', 'Ash',
    'Briar', 'Cypress', 'Darby', 'Echo', 'Fern', 'Glen',
  ],
  ballots: [
    // A-first voters (6) — polarizing, rarely rank B high
    ['A', 'D', 'C', 'B'],
    ['A', 'D', 'C'],
    ['A', 'C', 'D'],
    ['A', 'D', 'B', 'C'],
    ['A', 'C'],
    ['A', 'D'],
    // B-first voters (4) — consensus builder
    ['B', 'C', 'A', 'D'],
    ['B', 'C', 'D'],
    ['B', 'D', 'C', 'A'],
    ['B', 'C'],
    // C-first voters (4) — second pref is B
    ['C', 'B', 'D', 'A'],
    ['C', 'B', 'A'],
    ['C', 'B', 'D'],
    ['C', 'B'],
    // D-first voters (2) — redistributes to B
    ['D', 'B', 'C', 'A'],
    ['D', 'C', 'B'],
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
 * Varied ballot depths.
 */
const comebackFromThird: DemoScenario = {
  name: 'Comeback from Third Position',
  description: 'C starts in third place but appears in nearly everyone\'s top three. Layered preferences propel C to victory.',
  options: ['A', 'B', 'C', 'D', 'E', 'F'],
  participants: [
    'Avery', 'Brook', 'Charlie', 'Drew', 'Emery', 'Finley',
    'Glenn', 'Hadley', 'Ira', 'Jules', 'Kai', 'Lark',
    'Marlow', 'Noel', 'Oakley', 'Phoenix',
  ],
  ballots: [
    // A-first voters (5) — some have C in second
    ['A', 'C', 'B', 'D', 'E', 'F'],
    ['A', 'B', 'C'],
    ['A', 'C', 'D', 'B'],
    ['A', 'B', 'D', 'C', 'E', 'F'],
    ['A', 'D', 'C'],
    // B-first voters (4) — some have C in second
    ['B', 'C', 'A', 'D', 'E', 'F'],
    ['B', 'A', 'C'],
    ['B', 'C', 'D', 'A'],
    ['B', 'C', 'A'],
    // C-first voters (3) — modest first support
    ['C', 'A', 'B', 'D'],
    ['C', 'B', 'A'],
    ['C', 'D', 'A', 'B'],
    // D-first voters (2) — redistribute to C
    ['D', 'C', 'A', 'B'],
    ['D', 'C'],
    // E-first voter (1) — redistributes to C
    ['E', 'C', 'D'],
    // F-first voter (1) — redistributes to C
    ['F', 'C', 'D', 'A'],
  ],
  teachableMoment: 'Highlights how layered preferences matter more than top-line position. C was rarely anyone\'s first choice, but was nearly everyone\'s second or third — making it the true consensus.',
}

/**
 * Scenario 4: Maine 2018 — First U.S. House Race Decided by Ranked Choice
 *
 * Based on the real Maine 2nd Congressional District election of November 2018.
 * Poliquin (R) led Golden (D) on first-choice votes 46% to 45%.
 * Two independents (Bond, Hoar) were eliminated.
 * ~44% of their support transferred to Golden, ~20% to Poliquin, ~35% exhausted.
 * Golden overtook Poliquin 50.6% to 49.4%.
 *
 * Scaled to 16 voters with proportionally accurate distributions:
 * Poliquin 7, Golden 7, Bond 1, Hoar 1.
 * Both independents' second preferences favor Golden → Golden wins.
 */
const maine2018: DemoScenario = {
  name: 'Maine 2018: The Race That Made History',
  description: 'Based on the real 2018 Maine congressional election — the first U.S. House race ever decided by ranked choice. Republican Poliquin led Democrat Golden after the first count, but independent voters\' second choices changed the outcome.',
  options: ['Poliquin', 'Golden', 'Bond', 'Hoar'],
  participants: [
    'Abigail', 'Ben', 'Caleb', 'Donna', 'Earl',
    'Fiona', 'George', 'Helen', 'Isaac', 'Janet',
    'Keith', 'Linda', 'Mike', 'Nancy', 'Owen', 'Pam',
  ],
  ballots: [
    // Poliquin-first voters (7) — some rank Golden low or not at all
    ['Poliquin', 'Bond', 'Golden'],
    ['Poliquin', 'Golden'],
    ['Poliquin'],
    ['Poliquin', 'Bond'],
    ['Poliquin', 'Golden', 'Bond'],
    ['Poliquin'],
    ['Poliquin', 'Bond', 'Golden', 'Hoar'],
    // Golden-first voters (7) — some rank Bond second
    ['Golden', 'Bond', 'Poliquin'],
    ['Golden', 'Bond'],
    ['Golden'],
    ['Golden', 'Poliquin'],
    ['Golden', 'Bond', 'Hoar'],
    ['Golden', 'Hoar', 'Bond'],
    ['Golden', 'Bond', 'Poliquin', 'Hoar'],
    // Bond-first voter (1) — second choice Golden (matches real transfer pattern)
    ['Bond', 'Golden', 'Poliquin', 'Hoar'],
    // Hoar-first voter (1) — second choice Golden
    ['Hoar', 'Golden', 'Bond', 'Poliquin'],
  ],
  teachableMoment: 'This demo mirrors the real 2018 Maine election — the first U.S. House race ever decided by ranked choice voting. Republican Bruce Poliquin led on first-choice votes, but Democrat Jared Golden won after independent voters\' second preferences were counted. It proved that in a close race, broad appeal across the full electorate matters more than a narrow first-choice lead.',
}

/**
 * Scenario 5: Alaska 2022 — Palin's Name Recognition Wasn't Enough
 *
 * Based on the real Alaska special election of August 2022.
 * Peltola (D) 40%, Palin (R) 31%, Begich (R) 29% in round 1.
 * When Begich eliminated: 50% transferred to Palin, 29% to Peltola, 21% exhausted.
 * Peltola won 51.5% to 48.5%.
 *
 * Scaled to 16 voters:
 * Peltola 7, Palin 5, Begich 4.
 * Of 4 Begich voters: 2 → Palin, 1 → Peltola, 1 exhausted.
 * Final: Peltola 8, Palin 7, 1 inactive → threshold 8 → Peltola wins.
 */
const alaska2022: DemoScenario = {
  name: 'Alaska 2022: Palin\'s Name Wasn\'t Enough',
  description: 'Based on the real 2022 Alaska special election. Republican Sarah Palin had the biggest name in the race, but Democrat Mary Peltola won by earning second-choice support from the other Republican\'s voters.',
  options: ['Peltola', 'Palin', 'Begich'],
  participants: [
    'Raven', 'Spruce', 'Timber', 'Denali', 'Willow',
    'Kodiak', 'Juneau', 'Sitka', 'Kiska', 'Tundra',
    'Aurora', 'Glacier', 'Summit', 'Birch', 'Inlet', 'Orca',
  ],
  ballots: [
    // Peltola-first voters (7) — some rank Begich, a few rank Palin low
    ['Peltola', 'Begich', 'Palin'],
    ['Peltola', 'Begich'],
    ['Peltola'],
    ['Peltola', 'Begich', 'Palin'],
    ['Peltola'],
    ['Peltola', 'Begich'],
    ['Peltola', 'Palin'],
    // Palin-first voters (5) — loyal base, some rank Begich
    ['Palin', 'Begich', 'Peltola'],
    ['Palin', 'Begich'],
    ['Palin'],
    ['Palin', 'Begich', 'Peltola'],
    ['Palin'],
    // Begich-first voters (4) — split transfers: 2 Palin, 1 Peltola, 1 exhausted
    ['Begich', 'Palin', 'Peltola'],
    ['Begich', 'Palin'],
    ['Begich', 'Peltola', 'Palin'],
    ['Begich'],
  ],
  teachableMoment: 'This demo mirrors the real 2022 Alaska special election. Sarah Palin had the most famous name in the race, but Mary Peltola won by earning broader support. When fellow Republican Begich was eliminated, enough of his voters crossed party lines to give Peltola the majority. Name recognition and a loyal base weren\'t enough — the winner needed support beyond her own camp.',
}

export const scenarios: DemoScenario[] = [
  earlyLeaderLateOvertake,
  polarizingVsConsensus,
  comebackFromThird,
  maine2018,
  alaska2022,
]
