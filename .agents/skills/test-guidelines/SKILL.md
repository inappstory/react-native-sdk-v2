---
name: test-guidelines
description: Test conventions for this SDK — file layout, naming, native-module mocking, and the assertion rules the mutation gate demands. Use when writing, changing or reviewing tests, adding coverage, working test-first / red-green, or reproducing a bug with a test.
---

Conventions for all new and modified tests. Existing tests already follow them — match the
surrounding file rather than inventing a new shape. The gates and thresholds these tests must
clear live in [QA.md](../../../QA.md); this skill is about how the tests themselves are written.

## Test-first loop

Work in vertical slices: one failing test → the minimal code that makes it pass → repeat.
Do not write all the tests first and then the implementation — that asserts *imagined*
behaviour and locks in a structure before you understand it.

New behaviour ships with a test that fails without the change. A bug fix ships with a test
that reproduces the bug first — build the red loop the `diagnosing-bugs` way before theorising.

## File layout

- All tests live in `src/__tests__/`, never next to the source.
- One file per module, named after it: `src/core/StoryManager.ts` → `src/__tests__/StoryManager.test.ts`.
  The small `src/utils/*` helpers share a single `utils.test.ts` — keep them there.
- Start every file with `/// <reference types="jest" />`.

## Naming

`describe('<unit>')` + `it('<verb phrase>')`, so the concatenation reads as a sentence:
*"generateId returns a non-empty base36 string"*.

- Plain verb phrases: `returns …`, `calls through to native`, `passes the options map to native`.
- Never prefix with `should`.
- Negative tests state the absence explicitly: `does not …`, `throws …`, `returns null when …`,
  `ignores …`. Not `fails`, not `no events`.
- Group by the behaviour under test (`describe('runtime setters')`), not by the mechanics.
- Table-driven cases use `it.each` with an `as const` tuple list — see the runtime-setter block
  in `StoryManager.test.ts`.

## Mocking the native side

Everything below the TurboModule boundary is mocked. The pattern, at the top of the file:

```ts
jest.mock('../specs/NativeStoryManager', () => ({
  __esModule: true,
  default: {
    initWith: jest.fn().mockResolvedValue(undefined),
    setLang: jest.fn(),
    // …one entry per method the test touches
  },
}));

const native = NativeStoryManager as jest.Mocked<typeof NativeStoryManager>;

beforeEach(() => {
  jest.clearAllMocks();
});
```

- List the mocked methods explicitly. An auto-mock hides a method that was never wired up —
  the exact parity bug these tests exist to catch.
- Event modules (`Native*Events`) mock each event as `jest.fn(() => ({ remove: jest.fn() }))`
  plus their `setup*` method. `subscribeNativeEvent` calls `module[event](handler)` directly on
  the new architecture and only falls back to `NativeEventEmitter` when that method is missing —
  so an event mock without a `remove` breaks unsubscription silently.
- Never instantiate `NativeEventEmitter` in a test. Exercise the fallback the way
  `utils.test.ts` does: by omitting the method from the mock.
- Shared SUT instances go in a `beforeEach` inside the narrowest `describe` that needs them,
  never at file scope — state leaks between tests otherwise.
- Async microtasks: use the local `flush()` helper (`new Promise(r => setImmediate(r))`).
  Timers: `jest.useFakeTimers()`. Never a real clock, real network or real filesystem.

## Assertions — what the mutation gate demands

The suite is graded by [Stryker](../../../stryker.config.json), not just by coverage: a surviving
mutant is a line no assertion pins down. Three rules do most of the killing.

- **Assert the literal, not the constant.** `expect(x).toBe(2)`, not
  `expect(x).toBe(SOME_CONSTANT)` when production computes `x` from the same constant — that
  assertion passes by construction and survives a mutation of the constant's value. Using the
  constant as a lookup *key* is fine; pin the expected *value* as a literal.
- **Specific matchers over generic ones.** `toHaveBeenCalledWith('key', '42', …)` over
  `toHaveBeenCalled()`; `toBe(false)` over `toBeFalsy()`; `toMatch(/^[0-9a-z]+$/)` over
  `toBeDefined()`. A generic matcher is where mutants hide.
- **One logical assertion per test.** Several `expect()` calls are fine when they verify one
  behaviour; an unrelated assertion tacked on is noise.

A *new* surviving mutant is a missing assertion, not noise. The known equivalent survivors are
listed in QA.md ("Known equivalent survivors") and are the reason `break` sits at 88 — don't
try to kill those.

## What not to test

The measured scope is deliberately narrow: `src/core/**`, `src/utils/**`, the feed store and
its native-event bridge, plus `src/components/StoriesList/cardGeometry.ts`. Out of scope on
purpose — `src/specs/**` (declarations), `src/types/**` and `src/index.ts` (types and
re-exports), `src/components/**` (would assert on mocks, not behaviour), and the two
renderer-bound hooks. They are covered by the manual checklist in QA.md instead.

Moving a file in or out of that scope means editing **both** `jest.collectCoverageFrom` in
`package.json` and `mutate` in `stryker.config.json` — they must stay in sync.

Within the scope, test the behaviour your change owns: the contract at the JS/native boundary,
branching, data transformation, precedence, error paths. Don't re-prove what a dependency
already covers.
