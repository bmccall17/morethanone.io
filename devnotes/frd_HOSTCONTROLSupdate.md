frd_HOSTCONTROLSupdate.md

---
  The FRD covers 3 feature areas with increasing complexity:

  Feature 1 — Host as Participant Toggle

  Adds a toggle so the host can opt-in to vote. This touches the rounds table (new setting), the host lobby UI, the
  join/ranking flow (auto-creating a participant for the host), and the tally engine (counting/excluding the host's
  ranking).

  Feature 2 — Show Processing Toggle (Live Transparency)

  A host toggle that, when enabled, pushes round-by-round processing to participant devices in real time (instead of
  just final results). This needs a new realtime channel or status flow so participants can watch eliminations/transfers
   as they happen.

  Feature 3 — Share Results Flow

  When processing is hidden, the host clicks "Share Results" which generates a stable shareable URL and simultaneously
  pushes the final result + explanation + link to all participants. Currently "share" is a PNG download — this changes
  it to a persistent URL-based share.

---

## host controls – required updates

### 1. host as participant toggle

* add a control that allows the **host to opt in or out as a participant**
* when enabled, the host:

  * appears in the participant list
  * can submit rankings like any other participant
  * their submission is counted in tallies and thresholds
* when disabled, the host:

  * remains facilitator-only
  * does not affect totals or outcomes

default state: **host is not a participant**

---

### 2. show processing toggle (live transparency)

* add a host-only toggle: **“show processing to participants”**
* when enabled:

  * participants see the **ranked-choice processing live**, round by round
  * eliminations, exhausted rankings, thresholds, and transfers are revealed in real time on participant devices
* when disabled (default behavior):

  * participants only see the **final result + explanation**
  * no intermediate rounds or live computation are shown

default state: **off (final results only)**

---

### 3. share results flow (when processing is hidden)

if the host **does not** enable “show processing”:

* on completion, the host clicks **“share results”**
* this triggers two things simultaneously:

**a. shareable URL**

* generate and reveal a **stable, shareable results URL**
* link should be copyable and suitable for post-session sharing

**b. participant results view**

* participants are shown:

  * the **final result**
  * a **clear explanation of how the outcome was reached**
  * the **same shareable results link**, visible in their UI

note: participants should not need host action beyond “share results” to receive this view

---

### defaults summary

* host is **not** a participant
* participants **do not** see live processing
* participants receive **final result + explanation**
* shareable URL appears only at result-sharing moment unless live processing is enabled

---
