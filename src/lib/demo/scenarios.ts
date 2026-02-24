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
 * Based on the real Maine 2nd Congressional District election, November 6, 2018.
 * 289,624 ballots cast. Participants are the actual counties in ME-02.
 *
 * Real Round 1: Poliquin 134,184 (46.3%), Golden 132,013 (45.6%),
 *               Bond 16,552 (5.7%), Hoar 6,875 (2.4%)
 * Real Round 2: Golden 142,440 (50.6%), Poliquin 138,931 (49.4%)
 *               Exhausted: 8,253 (2.8%)
 *
 * Transfer pattern from Bond+Hoar: 44.5% → Golden, 20.3% → Poliquin, 35.2% exhausted
 *
 * Scaled to 24 ballots (each ≈ 12,068 real votes):
 *   Poliquin 11, Golden 11, Bond 1, Hoar 1
 *   Bond → Golden, Hoar → exhausted
 *   Final: Golden 12, Poliquin 11, 1 exhausted → Golden wins
 *
 * County-level lean: Poliquin carried Aroostook, Penobscot, Piscataquis,
 * Somerset, Oxford, Washington, Kennebec. Golden carried Androscoggin,
 * Hancock, Waldo, Franklin.
 */
const maine2018: DemoScenario = {
  name: 'Maine 2018: The Race That Made History',
  description: 'The real 2018 Maine 2nd District election — the first U.S. House race ever decided by ranked choice. 289,624 voters. Republican Poliquin led Democrat Golden 46.3% to 45.6% after the first count, but independent voters\' second choices flipped the outcome.',
  options: ['Poliquin', 'Golden', 'Bond', 'Hoar'],
  participants: [
    // Counties in Maine's 2nd Congressional District
    'Penobscot',     // largest county in CD-2, leaned Poliquin
    'Androscoggin',  // leaned Golden
    'Aroostook',     // leaned Poliquin strongly
    'Kennebec',      // partial, leaned Poliquin
    'Oxford',        // leaned Poliquin
    'Hancock',       // leaned Golden strongly
    'Somerset',      // leaned Poliquin
    'Franklin',      // leaned Golden
    'Waldo',         // leaned Golden
    'Washington',    // leaned Poliquin
    'Piscataquis',   // leaned Poliquin strongly
    'Knox',          // leaned Golden
    'Lincoln',       // leaned Golden
    'Sagadahoc',     // leaned Golden
    'Penobscot S.',  // southern Penobscot, split
    'Aroostook N.',  // northern Aroostook, Poliquin
    'Androscoggin W.', // western, Golden
    'Kennebec S.',   // southern Kennebec, split
    'Oxford E.',     // eastern Oxford, split
    'Hancock N.',    // northern Hancock, Golden
    'Somerset W.',   // western Somerset, Poliquin
    'Penobscot W.',  // western Penobscot, split
    'Bond voters',   // independent Bond supporters
    'Hoar voters',   // independent Hoar supporters
  ],
  ballots: [
    // Poliquin-first ballots (11 of 24 = 45.8%, real: 46.3%)
    // County-based, reflecting actual geographic lean
    ['Poliquin', 'Golden', 'Bond', 'Hoar'],   // Penobscot — close, ranked all
    ['Poliquin', 'Bond', 'Golden'],            // Aroostook — strong Poliquin
    ['Poliquin', 'Bond'],                      // Piscataquis — strong Poliquin, few prefs
    ['Poliquin', 'Golden', 'Bond'],            // Kennebec — moderate
    ['Poliquin', 'Bond', 'Golden'],            // Oxford — leaned Poliquin
    ['Poliquin'],                              // Washington — Poliquin, no backup
    ['Poliquin', 'Golden'],                    // Somerset — Poliquin lean
    ['Poliquin', 'Bond', 'Golden', 'Hoar'],   // Aroostook N. — ranked all
    ['Poliquin'],                              // Piscataquis — bullet vote
    ['Poliquin', 'Golden', 'Bond'],            // Penobscot S. — moderate
    ['Poliquin', 'Bond'],                      // Somerset W. — Poliquin lean
    // Golden-first ballots (11 of 24 = 45.8%, real: 45.6%)
    ['Golden', 'Bond', 'Poliquin', 'Hoar'],   // Androscoggin — Golden lean
    ['Golden', 'Poliquin', 'Bond'],            // Hancock — strong Golden
    ['Golden', 'Bond', 'Poliquin'],            // Franklin — Golden lean
    ['Golden', 'Poliquin'],                    // Waldo — Golden lean
    ['Golden', 'Bond', 'Hoar', 'Poliquin'],   // Knox — Golden lean
    ['Golden', 'Bond', 'Poliquin'],            // Lincoln — Golden lean
    ['Golden', 'Poliquin', 'Bond'],            // Sagadahoc — Golden lean
    ['Golden', 'Bond'],                        // Androscoggin W. — Golden
    ['Golden'],                                // Hancock N. — strong Golden
    ['Golden', 'Poliquin', 'Bond', 'Hoar'],   // Kennebec S. — moderate
    ['Golden', 'Bond', 'Poliquin'],            // Penobscot W. — split area
    // Bond-first ballot (1 of 24 = 4.2%, real: 5.7%)
    // Real transfer: 44.5% → Golden, 20.3% → Poliquin, 35.2% exhausted
    ['Bond', 'Golden', 'Poliquin', 'Hoar'],   // Bond voters — 2nd choice Golden
    // Hoar-first ballot (1 of 24 = 4.2%, real: 2.4%)
    ['Hoar'],                                  // Hoar voters — exhausted (no 2nd pref)
  ],
  teachableMoment: 'This demo mirrors the real 2018 Maine election — the first U.S. congressional race ever decided by ranked choice voting. Of 289,624 ballots, Poliquin led Golden by 2,171 votes on first count. But when Bond and Hoar were eliminated, Golden gained 10,232 transfer votes to Poliquin\'s 4,695 — flipping the result. 8,253 ballots exhausted. Final: Golden 50.6%, Poliquin 49.4%.',
}

/**
 * Scenario 5: Alaska 2022 — Palin's Name Recognition Wasn't Enough
 *
 * Based on the real Alaska at-large special election, August 16, 2022.
 * 188,582 ballots cast. Participants are actual Alaska boroughs and census areas.
 *
 * Real Round 1: Peltola 75,799 (40.2%), Palin 58,973 (31.3%), Begich 53,810 (28.5%)
 * Real Round 2: Peltola 91,266 (51.5%), Palin 86,026 (48.5%)
 *               Exhausted: 11,243 + 47 overvotes
 *
 * Begich transfer: 50.3% → Palin (27,053), 28.7% → Peltola (15,467),
 *                  20.9% exhausted (11,243), 0.1% overvotes (47)
 *
 * Scaled to 24 ballots (each ≈ 7,858 real votes):
 *   Peltola 10, Palin 8, Begich 6
 *   Of 6 Begich: 3 → Palin, 2 → Peltola, 1 exhausted
 *   Final: Peltola 12, Palin 11, 1 exhausted → Peltola wins
 *
 * Peltola strong: Bethel, Nome, rural Alaska Native areas, Juneau, Sitka
 * Palin strong: Mat-Su Valley, Kenai, Fairbanks suburbs
 * Begich strong: Anchorage suburbs, moderate Republican areas
 */
const alaska2022: DemoScenario = {
  name: 'Alaska 2022: Palin\'s Name Wasn\'t Enough',
  description: 'The real 2022 Alaska special election. 188,582 voters. Democrat Mary Peltola led the first count with 40%, but Republicans Sarah Palin (31%) and Nick Begich (29%) held a combined majority. When Begich was eliminated, his voters\' second choices decided everything.',
  options: ['Peltola', 'Palin', 'Begich'],
  participants: [
    // Alaska boroughs and census areas
    'Anchorage',         // largest, politically mixed
    'Mat-Su Valley',     // strong Republican
    'Fairbanks',         // moderate, leans R
    'Kenai Peninsula',   // leans Republican
    'Juneau',            // leans Democratic
    'Bethel',            // strong Peltola (Alaska Native area)
    'Nome',              // strong Peltola (Alaska Native area)
    'Sitka',             // leans Peltola
    'Kodiak Island',     // mixed
    'Ketchikan',         // leans R
    'North Slope',       // Alaska Native area, Peltola
    'Dillingham',        // Alaska Native area, Peltola
    'Anchorage S.',      // south Anchorage, moderate R
    'Anchorage E.',      // east Anchorage, Begich territory
    'Mat-Su N.',         // north valley, strong Palin
    'Fairbanks N.',      // north star, moderate
    'Kenai S.',          // southern peninsula, Palin lean
    'Anchorage W.',      // west Anchorage, diverse
    'Bethel S.',         // rural, strong Peltola
    'Valdez-Cordova',    // mixed
    'Denali',            // small, mixed
    'Aleutians',         // remote, Peltola
    'Wrangell-Petersburg', // small, leans R
    'Yukon-Koyukuk',     // Alaska Native area, strong Peltola
  ],
  ballots: [
    // Peltola-first ballots (10 of 24 = 41.7%, real: 40.2%)
    ['Peltola', 'Begich', 'Palin'],   // Juneau — moderate D, open to Begich
    ['Peltola', 'Begich'],             // Bethel — strong Peltola
    ['Peltola'],                       // Nome — strong Peltola, no backup
    ['Peltola', 'Begich', 'Palin'],   // Sitka — moderate D
    ['Peltola'],                       // North Slope — strong Peltola
    ['Peltola', 'Begich'],             // Dillingham — Alaska Native area
    ['Peltola', 'Begich', 'Palin'],   // Anchorage W. — diverse, ranked all
    ['Peltola'],                       // Bethel S. — rural, strong Peltola
    ['Peltola', 'Begich'],             // Aleutians — remote, Peltola
    ['Peltola'],                       // Yukon-Koyukuk — strong Peltola
    // Palin-first ballots (8 of 24 = 33.3%, real: 31.3%)
    ['Palin', 'Begich', 'Peltola'],   // Mat-Su Valley — strong Palin
    ['Palin', 'Begich'],               // Kenai Peninsula — Palin lean
    ['Palin'],                         // Mat-Su N. — strong Palin, bullet vote
    ['Palin', 'Begich', 'Peltola'],   // Ketchikan — leans R
    ['Palin'],                         // Kenai S. — Palin lean, no backup
    ['Palin', 'Begich'],               // Fairbanks N. — moderate R
    ['Palin', 'Begich', 'Peltola'],   // Denali — small, ranked all
    ['Palin', 'Begich'],               // Valdez-Cordova — R lean, Palin first
    // Begich-first ballots (6 of 24 = 25.0%, real: 28.5%)
    // Real transfer: 50.3% Palin, 28.7% Peltola, 20.9% exhausted
    // Of 6: 3 → Palin, 2 → Peltola, 1 exhausted
    ['Begich', 'Palin', 'Peltola'],   // Anchorage — moderate R, ranked Palin 2nd
    ['Begich', 'Palin'],               // Anchorage S. — moderate R suburb
    ['Begich', 'Peltola', 'Palin'],   // Anchorage E. — Begich home turf, crossed over
    ['Begich', 'Palin', 'Peltola'],   // Fairbanks — moderate, Palin 2nd
    ['Begich', 'Peltola'],             // Kodiak Island — mixed, crossed over
    ['Begich'],                        // Wrangell-Petersburg — small, exhausted
  ],
  teachableMoment: 'This demo mirrors the real 2022 Alaska special election. Of 188,582 ballots, Peltola led but two Republicans held a combined 60%. When Begich was eliminated, 27,053 of his votes went to Palin but 15,467 crossed party lines to Peltola — and 11,243 exhausted. That cross-party second-choice support gave Peltola the majority: 51.5% to 48.5%. Palin\'s famous name and loyal base weren\'t enough without broader appeal.',
}

export const scenarios: DemoScenario[] = [
  earlyLeaderLateOvertake,
  polarizingVsConsensus,
  comebackFromThird,
  maine2018,
  alaska2022,
]
