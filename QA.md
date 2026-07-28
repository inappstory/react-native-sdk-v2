# QA

How this SDK is verified before a release. Automated checks cover the JS layer;
the native bridges and the UI components are covered by the manual checklist —
they need a device and a real API key, so a unit test cannot speak for them.

## Quality gates

| Gate | Command | Threshold | Enforced |
| --- | --- | --- | --- |
| Lint | `yarn lint` | no errors | CI |
| Types | `yarn typecheck` | no errors | CI |
| Unit tests | `yarn test` | all green | CI |
| Coverage | `yarn test:coverage` | 95% statements / lines / functions, 90% branches | CI (jest `coverageThreshold`) |
| Mutation score | `yarn test:mutation` | break below 88%, target 95% | CI (stryker `thresholds.break`) |

A build fails on its own when a gate is missed — the thresholds live in
[package.json](package.json) (`jest.coverageThreshold`) and
[stryker.config.json](stryker.config.json) (`thresholds`), not in a wiki page.

### Scope of the automated gates

Measured: `AppearanceManager`, `StoryManager`, `hooks/`, `helpers/`.

Not measured, on purpose:

- `src/specs/**`, `src/Native*.ts` — TurboModule declarations, no logic to test.
- `src/data/**`, `src/index.ts`, `src/GlobalsWrapper.ts` — types and re-exports.
- `src/stories/**`, `src/banners/**` — components that render native views; a
  renderer test would assert on mocks, not on behaviour. They are covered by the
  manual checklist below.

Keep the two scope lists (`jest.collectCoverageFrom` and `stryker.mutate`) in
sync when a file moves.

## Why mutation testing on top of coverage

Coverage says a line ran; the mutation score says a test would have noticed if
that line were wrong. Stryker rewrites the source (`true` → `false`, `'right'` →
`''`, a removed `console.error`, …) and reruns the suite: a mutant that survives
is a line no assertion actually pins down.

Run `yarn test:mutation` and open `reports/mutation/mutation.html` for the
annotated source.

**Known equivalent survivors** (they cannot be killed by a unit test, and are
the reason `break` sits at 88 rather than 100):

- Module-name string literals passed to `subscribeNativeEvent` — the name only
  reaches `NativeEventEmitter` on the old architecture; with TurboModules the
  method call path wins. The fallback itself is tested in
  [helpers.test.ts](src/__tests__/helpers.test.ts).
- Class field initializers (`apiKey = ''`, `soundEnabled = true`, …) that the
  constructor overwrites on every path.
- zustand's `replace` flag on the reducers that only add keys — they return a
  complete state object, so merge and replace produce the same result. (On
  `clearFeed`, which deletes a key, the flag does matter and the mutant dies.)

If a *new* mutant survives, treat it as a missing assertion, not as noise.

## Per-PR checklist

1. `yarn lint && yarn typecheck && yarn test:coverage` — all green.
2. `yarn test:mutation` when the change touches `src/` logic; no new survivor.
3. New behaviour comes with a test that fails without the change.
4. A bug fix comes with a test that reproduces the bug first.
5. Public API changed → [README.md](README.md) updated in the same PR.
6. Native side changed → both platforms rebuilt (below) and the parity notes in
   [PARITY_IOS_VS_ANDROID.md](PARITY_IOS_VS_ANDROID.md) updated.

## Manual QA — native and UI

Run against the example app on **both** platforms; a JS-only change still needs
one platform pass because the whole SDK is a bridge.

```sh
yarn install
yarn example start
yarn example ios      # and: yarn example android
```

### Smoke (every release)

- [ ] `StoryManager.create` with a real API key: the list loads, no red box.
- [ ] `StoriesList` renders cards, scrolls, and reflects `AppearanceManager`
      card options (title position, corner radius, gap).
- [ ] Tapping a card opens the reader; close returns to the list; the card is
      marked as opened.
- [ ] Reader controls follow `setCommonOptions`: like, dislike, favorite, share
      appear only when enabled.
- [ ] Sound toggle: `defaultMuted: true` opens the reader muted;
      `changeSound(true)` unmutes at runtime.
- [ ] `BannerCarousel` renders and its widget events arrive in JS.
- [ ] Favorites: favorite a story → it appears in the favorites feed →
      `removeAllFavorites()` empties it.
- [ ] Games: `preloadGames()` then `showGame(id)` opens and closes cleanly.
- [ ] In-app messages: `showIAMById` and `showIAMByEvent` display and close.
- [ ] Onboarding: `showOnboardings()` shows unseen stories only.
- [ ] Goods / product cart: the widget calls back into `getGoods`, the cart
      handlers answer, and the reader shows the returned items.
- [ ] CTA: a story button with a deeplink reaches `storyLinkClickHandler`;
      without a handler the OS opens the URL.

### Lifecycle and state (the regressions that hurt)

- [ ] `setApiKey` / `setSendStatistics` mid-session: the SDK reinitializes and
      tags, lang, placeholders and sound are still applied afterwards.
- [ ] `logout()` then a new `setUserID`: the feed reloads for the new user.
- [ ] Background → foreground with the reader open: no crash, no duplicate
      events.
- [ ] Two `StoriesList` instances on one screen: both keep receiving updates
      (the store subscription is app-wide, not per-list).
- [ ] Abort an open: call `showStory` with an `AbortSignal` and abort during
      load — the reader must not appear afterwards.
- [ ] Rotate the device with the reader open (Android): no crash.

### Failure paths

- [ ] Airplane mode: `onFailure` fires, the app does not crash, and the list
      recovers when the network returns.
- [ ] Wrong API key: `sessionFailure` reaches JS.
- [ ] Unknown story id in `showStory`: the promise rejects, no red box.

## Regressions to keep an eye on

Bugs the suite uncovered and now guards. Each has a test that fails if the old
behaviour comes back:

1. `StoryManager.fetchGoods` used to throw when the app never called
   `getGoods()`, leaving native waiting for a `commitGoods` that never came.
   It now commits an empty list.
2. The feed store used to mutate its arrays in place, so a selector on
   `feeds_<feed>_feed` kept seeing the same reference. Writes now replace the
   array.
3. `replaceInFeed` used to bump `update` only when it replaced a story, so a
   story arriving via `onStoryUpdate` before its list update stayed invisible.
