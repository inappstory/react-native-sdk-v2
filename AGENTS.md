# Agent instructions

This file is the single source of truth for AI coding agents working in this repo
(Claude Code, Codex, Cursor, etc).

`@inappstory/react-native-sdk` — a React Native wrapper around the native InAppStory
SDKs (iOS pod `InAppStory`, Android artifact from jitpack). Almost nothing is
implemented in JS: the package is a bridge, so a change is rarely "JS only".

## Vendor folders are generated

`.claude/`, `.codex/`, `.cursor/` are compiled from [.agents/](.agents/) by [.agents/setup](.agents/setup) and are gitignored. Don't edit them directly — edit the matching subfolder under `.agents/` and run `.agents/setup` (this also runs automatically on session start).

## Skills

Task-scoped instructions live in `.agents/skills/<name>/SKILL.md` and are mirrored into every
vendor folder by the same setup script. They are vendor-agnostic markdown — read the relevant
one before starting that kind of work, whether or not your tooling loads it for you.

- [`design-first`](.agents/skills/design-first/SKILL.md) — a new native method or event, a change
  to `src/index.ts`, anything crossing the bridge. Run it *before* writing the code.
- [`test-guidelines`](.agents/skills/test-guidelines/SKILL.md) — writing or changing tests,
  coverage, the mutation gate.
- [`diagnosing-bugs`](.agents/skills/diagnosing-bugs/SKILL.md) — a bug that resists, a flaky test,
  a regression.

## Repository layout

- `src/` — the JS side of the library, the only published source of truth.
  - `src/index.ts` — the public API surface. If an export changes here, it's a
    breaking-change candidate and README must be updated in the same PR.
  - `src/core/` — the classes: `StoryManager` (config, sessions, goods, games, IAM),
    `StoryEvents` (its `on*` base class, one method per native event stream),
    `CTAHandler` (link routing) and `AppearanceManager` (options serialized down to
    native).
  - `src/specs/` — codegen TurboModule specs (`NativeStoryManager`,
    `NativeAppearanceManager`, `Native*Events`). Declarations only, no logic.
  - `src/components/` — `StoriesList` (JS-rendered cards) and `BannerCarousel`
    (native view). `cardGeometry.ts` is pure layout math and is unit-tested.
  - `src/hooks/` — feed store (`zustand`) and the native-event subscriptions.
  - `src/types/` — shared type declarations only, one concept per file. No logic
    (excluded from coverage and mutation).
  - `src/utils/` — `subscribeNativeEvent` (TurboModule call with a legacy
    `NativeEventEmitter` fallback), `validation` (userId/tags limits), placeholders,
    id generation.
  - `src/__tests__/` — all Jest tests live here, not next to the sources.
- `android/src/main/java/com/inappstorysdk/` — Kotlin modules implementing the specs.
- `ios/` — Objective-C++ `.mm` bridges + Swift `*Impl` implementations; `ios/events/`
  mirrors `src/specs/Native*Events`, `ios/views/bannerview/` is the banner view.
- `android/generated/`, `ios/generated/` — **codegen output, never edit by hand.**
  Regenerated from `src/specs/` on build (`codegenConfig` in `package.json`).
- `example/` — the example app (a yarn workspace). The only way to test the bridge;
  not published.
- `lib/` — `bob` build output, gitignored, never edit.

## Environment & commands

Node `v22.20.0` (`.nvmrc`), **Yarn 4 workspaces — never `npm`**.

| Task | Command |
| --- | --- |
| Install | `yarn` |
| Types | `yarn typecheck` |
| Lint / fix | `yarn lint` / `yarn lint:fix` |
| Unit tests | `yarn test` (single file: `yarn test src/__tests__/utils.test.ts`) |
| Coverage | `yarn test:coverage` |
| Mutation tests | `yarn test:mutation` |
| Build the package | `yarn prepare` (`bob build`) |
| Example app | `yarn example start` / `yarn example ios` / `yarn example android` |
| Clean native+lib artifacts | `yarn clean` |

JS changes hot-reload in the example app; **native or `src/specs/` changes require a
rebuild** of the example app on the affected platform.

## Quality gates

Full detail lives in [QA.md](QA.md) — read it before touching tests or thresholds.

- Coverage: 95% statements / lines / functions, 90% branches (`jest.coverageThreshold`).
- Mutation score: build breaks below 88 (`stryker.config.json`).
- The tested scope is deliberately narrow: specs, types, `src/index.ts`, UI components
  and the two renderer-bound hooks are excluded and covered by the manual checklist
  in QA.md instead. **Keep `jest.collectCoverageFrom` and `stryker.mutate` in sync**
  when a file moves.
- A new surviving mutant is a missing assertion, not noise. The known equivalent
  survivors are listed in QA.md — don't "fix" those.
- New behaviour ships with a test that fails without the change; a bug fix ships with
  a test that reproduces the bug first.

## Code conventions

- TypeScript-first, `strict` + `noUncheckedIndexedAccess` + `noUnusedLocals`.
  `verbatimModuleSyntax` is on → type-only imports **must** use `import type`.
- Prettier via ESLint (single quotes, 2 spaces, trailing comma `es5`). Don't hand-format
  — run `yarn lint:fix`.
- Relative imports inside `src/`. The `@inappstory/react-native-sdk` alias exists for
  the example app only.
- A new native method means four coordinated edits: the spec in `src/specs/`, the
  Kotlin module, the Swift/ObjC++ pair, and the JS wrapper in `src/core/`. Landing
  one platform only is a parity bug — say so explicitly in the PR if it's intentional.
- Native events reach JS only through `subscribeNativeEvent`; don't instantiate
  `NativeEventEmitter` directly.
- The feed store is `zustand`: state is replaced, never mutated in place — a selector
  compares by reference and an in-place push is invisible to it (see QA.md
  "Regressions").

## Git, commits, PRs

- Conventional Commits (`fix`, `feat`, `refactor`, `docs`, `test`, `chore`), enforced by
  commitlint via lefthook. `pre-commit` also runs ESLint on staged files and `tsc`.
- **Never commit or push unless explicitly asked.**
- Before a rename or a delete, grep the whole repo — including `android/`, `ios/` and
  `example/` — for the old name. Native code doesn't type-check against JS.
- Public API change → README updated in the same PR. Native change → both platforms
  rebuilt and smoke-tested per the QA checklist.
- Releases run in CI: the **Release** workflow
  ([release.yml](.github/workflows/release.yml)), started manually via
  `workflow_dispatch` with `main` selected — release-it's `requireBranch: main`
  rejects anything else. Pass `--dry-run` in the `args` input to rehearse. The local
  `yarn release` does the same thing and is the fallback, not the normal path.
  The workflow runs lint, typecheck and the unit tests with coverage before
  release-it, so a failing gate leaves no tag and nothing published. Mutation tests
  are not part of it — run `yarn test:mutation` yourself.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Maintaining this file

When an instruction here turns out to be wrong or a documented path has moved, propose
the fix instead of working around it. Don't add task-specific notes, things obvious from
the code, or rules the linter already enforces.
