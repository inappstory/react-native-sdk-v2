---
name: design-first
description: Shape a bridge change before writing it — which modules, which seams, and all four platform edits named up front. Use when adding a native method or event, changing the exports in src/index.ts, adding a native view, or deciding where a seam should go. Produces a sketch to approve before implementation.
---

Almost nothing in this package is implemented in JS: it is a bridge, so a change is rarely
"JS only". The expensive mistakes here are **parity** (landing one platform) and **public
surface** (an export that becomes a breaking change). Both are cheap to catch in a sketch and
expensive to catch after the native rebuild.

The pass ends in a short sketch the user approves. Implementation does not start until it does.

## When to run

- A new native method, or a change to an existing one's signature.
- A new native event.
- A change to the exports in `src/index.ts`.
- A new native view, or a change to what `AppearanceManager` serializes down.
- Any moment you are deciding where a seam goes.

Skip it — and say you are skipping it — for a JS-only change that touches no spec, a localized
bug fix with obvious placement, and refactors that change no interface.

## Vocabulary

Use these words exactly, so the design stays legible across sessions.

- **Module** — anything with an interface and an implementation: a function, class, or file.
- **Interface** — everything a caller must know: the signature plus invariants, ordering,
  error modes, required config.
- **Deep module** — a lot of behaviour behind a small interface. The goal. A **shallow** module
  has an interface nearly as complex as its implementation.
- **Seam** — where behaviour can be swapped without editing in place; where a test double crosses.

Two checks settle most questions:

- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a
  pass-through — don't build it. If complexity reappears across several callers, it earns its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. If a test has to
  reach *past* the interface, the module is the wrong shape.

## 1. The parity checklist

A new native method is **four coordinated edits**. Name all four in the sketch, before writing any:

1. the spec in `src/specs/` — declaration only, no logic;
2. the Kotlin module in `android/src/main/java/com/inappstorysdk/`;
3. the Swift `*Impl` + Objective-C++ `.mm` pair in `ios/`;
4. the JS wrapper in `src/core/`.

Landing one platform is a parity bug. If it is deliberate, say so explicitly in the PR.

`android/generated/`, `ios/generated/` and `lib/` are build output — never edited by hand.
A change to `src/specs/` regenerates them, and requires an example-app rebuild on the affected
platform; JS-only changes hot-reload.

## 2. The public surface

`src/index.ts` is the published API. Any change to its exports is a breaking-change candidate,
and README is updated in the same PR. Keep a new type inside `src/` until an SDK user actually
needs it — every export is a maintenance burden and a compatibility liability.

Before a rename or a delete, grep the whole repo — `android/`, `ios/` and `example/` included.
Native code does not type-check against JS, so nothing else will catch it.

## 3. Design for testability

The native side cannot be faked. Therefore:

- **All logic lives in the JS wrapper above the TurboModule.** The seam is the spec module, and
  a test crosses it by mocking `src/specs/Native*` (see `test-guidelines`). A wrapper that is a
  bare pass-through has no logic to test — that's fine and expected; a wrapper with logic that
  can only be reached through native is the wrong shape.
- **The native path itself is covered by the manual checklist in [QA.md](../../../QA.md).** If a
  change needs a new manual check, add the line to that checklist as part of the change.
- **Accept dependencies, don't construct them** — a module that builds its own emitter can't be faked.

Events reach JS only through `subscribeNativeEvent` (`src/utils/subscribeNativeEvent.ts`), which
calls the module method directly on the new architecture and falls back to `NativeEventEmitter`
on the old one. A new event means a method on the matching `Native*Events` spec plus a
subscription through that helper — never a `NativeEventEmitter` built at the call site.

The feed store is zustand: state is **replaced, never mutated in place**. A selector compares by
reference, so an in-place push is invisible to it — this has already caused a regression
(QA.md, "Regressions" #2).

## 4. Write the sketch and get approval

Prose or bullets, not code. Present it and wait. The sketch is complete when it states:

- [ ] Each module, its interface, and whether it is new or modified
- [ ] All four platform edits for any new native method — or an explicit "JS only, no spec change"
- [ ] The seam each module's tests cross, and the mock that injects there (or "manual QA only")
- [ ] The public API impact: exports added/changed in `src/index.ts`, or "none"
- [ ] One alternative shape you considered and why you rejected it

On approval, implement under the conventions in AGENTS.md and write the tests under
`test-guidelines`, at the seams this sketch named.
