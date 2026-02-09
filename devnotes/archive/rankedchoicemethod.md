rankedchoicemethod.md
## the ranked choice method in plain language

a group is choosing **one** option from a set. each participant submits a **ranked list** of options (1st preference, 2nd preference, 3rd, etc.). the system processes these rankings in **rounds**:

* in each round, every participant’s submission contributes **one unit of support** to the **highest-ranked option on their list that is still eligible**.
* if an option has **more than half** of the current “active” support, it becomes the group choice.
* if nobody has more than half, the option with the **least** current support is removed, and the affected participants’ support **flows** to their next still-eligible preference.
* repeat until a single option crosses the threshold (or only one option remains).

this is exactly the 6-step flow ballotpedia describes (rank, check majority, eliminate lowest, transfer to next preference, retally, repeat). ([Ballotpedia][1])

---

## key definitions for developers

**option**
an item in the choice set (e.g., “tacos,” “thai,” “pizza”).

**ranking**
an ordered list of option ids (no duplicates). example: `[thai, tacos, pizza, bbq]`.

**eligible set**
options still “in play” this round.

**current top preference (for a ranking)**
the first option in the ranking that is still eligible.

**active ranking**
a ranking that still has at least one eligible option remaining.

**inactive ranking (exhausted)**
a ranking that has no eligible options left (because the participant ranked only a few options, and all of them were removed). ballotpedia’s example explicitly shows these accumulating as “inactive” across rounds. ([Ballotpedia][1])

**majority threshold**
computed from **active rankings only** in that round:

* let `A = number_of_active_rankings`
* threshold is `floor(A/2) + 1` (equivalently “more than half of A”)

ballotpedia describes this as “50 percent plus one” and notes the process repeats until someone has a majority of the remaining counted submissions. ([Ballotpedia][1])

---

## deterministic round processing

### round step

given:

* `rankings[]` (each is an array of option ids)
* `eligible` (set of option ids still in play)

compute:

1. **tally**

* initialize `counts[option]=0` for each eligible option
* `inactive=0`
* for each ranking `r`:

  * find `top = first item in r that is in eligible`
  * if found: `counts[top] += 1`
  * else: `inactive += 1`

2. **check for group choice**

* `active = total_rankings - inactive`
* if any option has `counts[opt] >= floor(active/2)+1`, declare it the group choice and stop.

3. **remove lowest**

* find `min_count = min(counts[opt])` across eligible
* define `lowest = { opt in eligible | counts[opt] == min_count }`

4. **tie handling for lowest (you must choose a rule)**
   ballotpedia notes procedures can vary by jurisdiction, so you should lock a clear product rule. ([Ballotpedia][1])
   common, simple v1 options:

* deterministic: eliminate the tied option with the fewest total appearances across all rankings (or fewest first-preference appearances in round 1), then stable-sort by option id
* seeded randomness: generate a seed from `round_id + round_number` and pick consistently

5. **update eligible**

* remove the selected lowest option from `eligible`
* go to next round

this matches ballotpedia’s description: eliminate the lowest, then re-count those participants’ next preferences in the next tally, repeating until one option has a majority. ([Ballotpedia][1])

---

## important edge cases to implement

### 1) partial rankings and inactive/exhausted support

participants may rank only 1–k options. as options drop out, some rankings can run out of eligible options and become inactive. your threshold should then shrink with `active`. ballotpedia’s worked example calls these “inactive” and shows them increasing over rounds. ([Ballotpedia][1])

### 2) “only one option left”

if `eligible.size == 1`, that remaining option becomes the group choice (even if it doesn’t meet the majority threshold due to many inactive rankings). in practice, you’ll hit this only if many rankings exhaust.

### 3) invalid submissions

decide and enforce:

* duplicates in a ranking (reject or de-dupe)
* rankings containing unknown option ids (reject or ignore unknowns)
* empty rankings (treat as immediately inactive)

### 4) audit trail payload for explainability

store per-round:

* `counts`
* `inactive`
* `eliminated_option`
* `transfers` (optional: can be derived by re-scanning rankings to see where support moved next)

ballotpedia’s examples illustrate why a round-by-round “story” is helpful for comprehension. ([Ballotpedia][1])

---

## developer-ready pseudocode

```ts
type OptionId = string;

type RoundResult = {
  roundIndex: number;
  counts: Record<OptionId, number>;
  inactive: number;
  active: number;
  threshold: number;
  eliminated?: OptionId;
  winner?: OptionId;
};

function chooseOneByRankings(
  rankings: OptionId[][],
  allOptions: OptionId[],
  breakTieLowest: (tied: OptionId[], context: {roundIndex: number}) => OptionId
): { winner: OptionId; rounds: RoundResult[] } {
  let eligible = new Set<OptionId>(allOptions);
  const rounds: RoundResult[] = [];
  const total = rankings.length;

  for (let roundIndex = 1; roundIndex <= 1000; roundIndex++) {
    const counts: Record<OptionId, number> = {};
    for (const opt of eligible) counts[opt] = 0;

    let inactive = 0;

    for (const r of rankings) {
      let top: OptionId | undefined;
      for (const opt of r) {
        if (eligible.has(opt)) { top = opt; break; }
      }
      if (top) counts[top] += 1;
      else inactive += 1;
    }

    const active = total - inactive;
    const threshold = Math.floor(active / 2) + 1;

    // winner check
    for (const opt of eligible) {
      if (counts[opt] >= threshold) {
        rounds.push({ roundIndex, counts, inactive, active, threshold, winner: opt });
        return { winner: opt, rounds };
      }
    }

    // if only one remains
    if (eligible.size === 1) {
      const only = Array.from(eligible)[0];
      rounds.push({ roundIndex, counts, inactive, active, threshold, winner: only });
      return { winner: only, rounds };
    }

    // find lowest
    let minCount = Infinity;
    for (const opt of eligible) minCount = Math.min(minCount, counts[opt]);

    const tiedLowest: OptionId[] = [];
    for (const opt of eligible) if (counts[opt] === minCount) tiedLowest.push(opt);

    const eliminated = tiedLowest.length === 1
      ? tiedLowest[0]
      : breakTieLowest(tiedLowest, { roundIndex });

    eligible.delete(eliminated);

    rounds.push({ roundIndex, counts, inactive, active, threshold, eliminated });
  }

  throw new Error("round limit exceeded");
}
```

---

## what to keep out of your product language, while keeping the math right

ballotpedia uses civic terms (and the acronym) to explain the method, but the underlying mechanism is simply:

* participants submit **ranked preferences**
* the system finds a **majority-supported** single choice through **sequential elimination** and **preference fallback**
* the “majority” is computed on the **active** (non-exhausted) submissions in each round

those are the load-bearing mathematical pieces to communicate to your devs. ([Ballotpedia][1])

[1]: https://ballotpedia.org/Ranked-choice_voting_%28RCV%29 "Ranked-choice voting (RCV) - Ballotpedia"
