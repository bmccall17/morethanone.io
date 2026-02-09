frd_HOSTCONTROLSupdateDEMOMODE.md
## new HOST feature to add (demo mode)

### demo mode overview

Demo Mode (New Feature)

 A standalone walkthrough mode with:
  - Step-through of predefined scenarios round by round
  - Optional plain-language explanations at each step
  - A composite view showing host panel + grid of mock participant views
  - 3 predefined scenarios with scripted ballot data


* add a host-only **“demo mode”** toggle for walkthrough and presentation purposes
* demo mode allows the host to **step through each phase of the process**, round by round
* include a secondary toggle: **“show explanations”**

  * when enabled, each step displays plain-language narration describing:

    * what just happened
    * why a selection was removed
    * how preferences were redistributed
    * how thresholds shift as options exhaust

default: demo mode **off**, explanations **off**

---

### multi-perspective demo view

* demo mode should include a **composite view** that shows:

  * the host’s control panel
  * a grid of **mock participant views**
* mock participant views should:

  * visibly differ from one another
  * reflect a wide spread of primary, secondary, and tertiary preferences
  * update live as rounds advance, mirroring what a real participant would see

goal: make variance and preference depth visually obvious at a glance

---

### predefined demo scenarios (for development + demos)

#### scenario 1: early leader, late overtake

**setup**

* 5 options: A, B, C, D, E
* option A leads strongly in first preferences
* options C and D are broadly liked but rarely first

**dynamic**

* E is removed first, its secondary preferences split mostly to C and D
* B is removed next, with a heavy tilt of secondary preferences toward C
* C overtakes A in later rounds and becomes the final outcome

**teachable moment**

* shows how broad, consistent second preferences can outweigh early dominance

---

#### scenario 2: polarizing favorite vs steady consensus

**setup**

* 4 options: A, B, C, D
* A has the most first preferences but is rarely selected beyond that
* B and C are commonly ranked second and third

**dynamic**

* D is removed early, redistributing mostly to B and C
* C is removed next, with the majority flowing to B
* B surpasses A despite A’s strong initial lead

**teachable moment**

* demonstrates how a polarizing option can lose to a consensus-friendly one

---

#### scenario 3: comeback from third position

**setup**

* 6 options: A, B, C, D, E, F
* A and B trade the lead early
* C starts in third with modest first preferences but appears frequently in top three rankings

**dynamic**

* F and E are removed first, flowing disproportionately to C
* D is removed next, again strengthening C
* C overtakes both A and B late and becomes the final selection

**teachable moment**

* highlights how layered preferences matter more than top-line position

---

### intent of demo mode

* enable hosts to **teach the process without live participants**
* support storytelling around why outcomes emerge
* clearly contrast this system with simple “highest first choice wins” mechanics, without naming or referencing them directly
