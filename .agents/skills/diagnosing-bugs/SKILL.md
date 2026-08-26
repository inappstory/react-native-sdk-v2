---
name: diagnosing-bugs
description: A discipline for bugs that resist — flaky tests, native/JS mismatches, regressions in this bridge. Use when something is broken, throwing, hanging, or failing intermittently, or when asked to diagnose or debug. Builds a fast red-capable loop before any hypothesis.
---

**The whole skill is Phase 1: get a loop that goes red on this bug.** Everything after is
mechanical once you have it. If you catch yourself reading code to form a theory before that
loop exists, stop — that is the exact failure this prevents.

For a trivial bug with an obvious fix and an obvious test, skip this and just write the failing
test. This is for the ones that resist.

## Phase 1 — Build the loop

A tight loop is fast, deterministic, and goes **red on this bug**. Spend disproportionate effort
here. Ways to build one, roughly in this order — the cost per iteration climbs steeply:

1. **A Jest test at the seam** — `yarn test src/__tests__/<file>.test.ts`. Seconds. The tightest
   loop there is; try it first even when the bug looks native.
2. **A mocked spec module** — drive the JS wrapper with `jest.mock('../specs/Native*')` and assert
   what it hands to native, or push an event handler yourself to replay the inbound path. Most
   "native" bugs are actually a wrong argument or a missed subscription on the JS side, and this
   reproduces them without a device.
3. **The feed store directly** — run the reducers over the sequence that triggered it. Ordering
   and reference-identity bugs live here (QA.md, "Regressions").
4. **The example app with hot reload** — `yarn example start`. Only for JS changes; a spec or
   native change is invisible to it.
5. **An example-app rebuild** — `yarn example ios` / `yarn example android`. Minutes per
   iteration, and it needs a real API key. Exhaust 1–3 before paying for this.
6. **Native logs** — Xcode console / `adb logcat`. When the bug never crosses into JS, this is
   the only place the evidence exists.

Once you have *a* loop, tighten it: narrow the scope, assert the exact symptom the user
described rather than "didn't crash", and make it deterministic (fake timers, no real network,
seeded randomness). A 2-second deterministic loop beats a 30-second flaky one.

### Completion criterion

Phase 1 is done when you can name **one command you have already run at least once** — paste the
invocation and its output — that is:

- [ ] **Red-capable** — drives the real bug path and asserts the user's exact symptom
- [ ] **Deterministic** — same verdict every run (for a flake: a pinned, high reproduction rate)
- [ ] **Fast** — seconds, not minutes

No red command, no Phase 2. If you genuinely cannot build one, say so explicitly, list what you
tried, and ask for what would unblock it: a device with a working API key, a recording with
timestamps, a native log, or permission for temporary instrumentation. Do not hypothesise without
a loop.

## Phase 2 — Reproduce and minimise

Run the loop, watch it go red, and confirm it is the failure the **user** described — not a
nearby one. Then shrink: cut inputs, callers, config and steps **one at a time**, re-running
after each cut. Done when removing any remaining element turns it green. The minimal repro
becomes the regression test.

## Phase 3 — Hypothesise

Generate **3–5 ranked, falsifiable hypotheses before testing any** — a single hypothesis anchors
you on the first plausible idea. Each states its prediction: "if X is the cause, changing Y makes
it vanish." No prediction means it's a vibe — sharpen or discard. Show the ranked list to the
user; they often re-rank it instantly. Don't block on it if they're away.

## Phase 4 — Instrument

One probe per prediction. **Change one variable at a time.**

- Prefer a breakpoint over logs where the environment supports it. One breakpoint beats ten logs.
- Otherwise log at the boundaries that distinguish hypotheses — never "log everything and grep".
- **Tag every debug log** with a unique prefix like `[DEBUG-a4f2]`, so cleanup is one grep.
- For a bridge bug, log on **both** sides of the boundary: what JS sent and what the native
  module received. The gap between them is usually the bug.

## Phase 5 — Fix and regression test

Write the regression test **before** the fix, and at a seam that exercises the real pattern as it
occurs at the call site (per `test-guidelines`). A too-shallow seam gives false confidence. If no
correct seam exists, **that is the finding** — note it; the architecture is preventing the bug
from being locked down.

Turn the minimised repro into a failing test, watch it fail, apply the fix, watch it pass, then
re-run the Phase 1 loop against the original un-minimised scenario.

## Phase 6 — Cleanup and post-mortem

- [ ] Original repro no longer reproduces
- [ ] Regression test passes (or the absence of a seam is documented)
- [ ] All `[DEBUG-…]` instrumentation removed — grep the prefix
- [ ] Throwaway harnesses deleted
- [ ] The correct hypothesis is stated in the commit message, so the next person learns
- [ ] If the bug was a class the suite should guard, add it to QA.md "Regressions"
- [ ] If the fix touched native, both platforms rebuilt and smoke-tested per QA.md

Then ask: **what would have prevented this?** If the answer is architectural — no good seam,
logic reachable only through native, a shallow wrapper hiding the real bug — hand off to
`design-first` with the specifics. Make that call after the fix is in, when you know the most.
