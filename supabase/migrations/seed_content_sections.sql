-- Seed content_sections from README.md content
INSERT INTO content_sections (slug, title, body, sort_order, is_published) VALUES
(
  'intro',
  '',
  'morethanone is a social decision tool for groups. A host creates a round, players rank the options in order of preference, and the system processes those rankings down to a single group choice. The result tends to reflect the broadest overlap in the room, the option that the most people can genuinely get behind.

it lives at [morethanoneio.vercel.app](https://morethanoneio.vercel.app/).',
  0,
  true
),
(
  'why-this-exists',
  'why this exists',
  'when a group of people tries to choose one thing (where to eat, what to prioritize, which name to pick), the usual approach is "everybody pick your favorite." that works when there''s a clear frontrunner. however, it falls apart when preferences are spread across several decent options. people split, the loudest voice wins, or people change their vote to try and help one win over one other, or the group just goes with whatever somebody suggests first. the actual collective preference stays hidden.

ranked choice is the well-studied solution to this problem. each person ranks the options. the system eliminates the least-supported option each round and redistributes that support to each person''s next preference, repeating until one option earns majority support. the math is clean. the outcomes are fair and the smartest version of the group mind. and the method has decades of research behind it.

the trouble is that ranked choice voting has become a political lightning rod. it is one of the most promising structural reforms in modern democracy, and the backlash against it has been driven almost entirely by partisan framing. people who would benefit enormously from RCV in their communities, workplaces, and friend groups never try it because the phrase itself has been poisoned by cable news cycles and campaign attack ads. the method got tangled up in the politics it was meant to improve.

morethanone takes the same proven math and puts it in a context where people can experience it directly: choosing a restaurant, picking a team name, deciding what game to play. when you watch your group converge on a choice through rounds of elimination and redistribution, you understand intuitively why the result feels right. that understanding transfers. the goal is to let people discover the power of expressive preference ranking on their own terms, in low-stakes moments that build genuine intuition.',
  1,
  true
),
(
  'how-it-works',
  'how it works',
  'a host creates a round by entering a prompt and a set of options. the system generates a short join code and QR code. players join on their phones, enter a display name (or generate a fun random one), and rank the options by dragging them into their preferred order. When the host closes ranking, processing begins.

the engine counts everyone''s current top choice. If any option holds more than half of the active support, it becomes the group choice. Otherwise, the option with the fewest supporters is eliminated, and those supporters'' rankings cascade to their next available preference. this repeats until one option crosses the majority threshold or stands alone.

the reveal shows the group how their choice emerged: round by round, with counts, eliminations, and transfers. a plain-language summary explains the outcome in two or three sentences. the host can switch between an animated bar chart view, a selection grid showing how each participant ranked, and a full results table with round-by-round data.',
  2,
  true
),
(
  'who-its-for',
  'who it''s for',
  'facilitators running workshops, classrooms, retreats, and meetups. friend groups deciding where to eat, what to watch, or what to do this weekend. teams choosing between several reasonable options for a name, a priority, a theme. anyone in a room (physical or virtual) with a group of people and a decision to make.

a typical session involves five to forty people, three to twelve options, and one to five minutes of ranking.',
  3,
  true
)
ON CONFLICT (slug) DO NOTHING;
