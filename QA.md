# QA

How this SDK is verified before a release. Automated checks cover the JS layer
and deterministic Android banner layout/lifecycle. Live native SDK content and UI
integration are covered by the manual checklist — they need a device and a
real API key, so synthetic tests cannot speak for them.

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

> **Where these actually run.** [ci.yml](.github/workflows/ci.yml) triggers on
> pushes and PRs to the `ci` branch only, so a PR into `main` runs no gate — run
> them locally before asking for review. The backstop is the manually started
> Release workflow ([release.yml](.github/workflows/release.yml)): it runs lint,
> typecheck and the unit tests with coverage before release-it, so a broken gate
> blocks the publish. Mutation testing is in neither path — run it by hand.

### Scope of the automated gates

Measured: `src/core/**`, `src/utils/**`, the feed store and its native event
bridge, plus `src/components/StoriesList/cardGeometry.ts` — pure card layout
math, opted back in explicitly.

Not measured, on purpose:

- `src/specs/**` — TurboModule declarations, no logic to test.
- `src/types/**`, `src/index.ts` — types and re-exports.
- `src/components/**` — components that render native views; a renderer test
  would assert on mocks, not on behaviour. Covered by the manual checklist below.
- `src/hooks/useFeedLoader.ts`, `src/hooks/useEventCallback.ts` — hooks bound to
  the React lifecycle. The repo has no renderer in devDependencies, so these are
  covered by the manual checklist too.

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
the reason `break` sits at 92 rather than 100):

- Module-name string literals passed to `subscribeNativeEvent` — the name only
  reaches `NativeEventEmitter` on the old architecture; with TurboModules the
  method call path wins. The fallback itself is tested in
  [utils.test.ts](src/__tests__/utils.test.ts).
- Class field initializers (`apiKey = ''`, `tags = []`, …) that the constructor
  overwrites on every path.
- zustand's `replace` flag on the reducers that only add keys — they return a
  complete state object, so merge and replace produce the same result. (On
  `clearFeed`, which deletes a key, the flag does matter and the mutant dies.)
- The `[]` dependency list of `useNativeFeedEvents` — the module-level
  `subscribed` guard already makes a re-run a no-op, so a mutated dependency
  array changes nothing observable.

Stryker also reports one `RuntimeError` on the `useFeedStore` factory arrow: the
mutant replaces the whole store initializer with `undefined` and zustand throws
at import time. It is not a survivor and does not count against the score.

If a *new* mutant survives, treat it as a missing assertion, not as noise.

## Per-PR checklist

1. `yarn lint && yarn typecheck && yarn test:coverage` — all green.
2. `yarn test:mutation` when the change touches `src/` logic; no new survivor.
3. New behaviour comes with a test that fails without the change.
4. A bug fix comes with a test that reproduces the bug first.
5. Public API changed → [README.md](README.md) updated in the same PR.
6. Native side changed → both platforms rebuilt and smoke-tested (below). Landing
   one platform only is a parity bug — say so explicitly in the PR description.

## Manual QA — native and UI

### Android grid measurement regression

Run on a connected Android device/emulator (no API key or network required):

```sh
cd example/android
./gradlew :inappstory_react-native-sdk:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.inappstory.reactnativesdk.view.BannerGridLayoutTest
```

These native tests exercise full-row measurement under a zero/constrained host
height, deferred loading until width is measured, size-event deduplication,
empty results, reload/reset/disposal, and height-only prop updates. They use
synthetic rows inside the real SDK grid, not live banner content.

### Banner list viewport regression

Run on a connected Android device/emulator (no API key or network required):

```sh
cd example/android
./gradlew :inappstory_react-native-sdk:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.inappstory.reactnativesdk.view.BannerListLayoutTest
```

These tests cover the constrained viewport (including zero height), one vertical
column, configuration after width becomes available, size-only updates, asymmetric
dp padding, the recycled-card radius workaround, pending-load disposal, and
retiring SDK request identities before reloading or clearing the place binding.
The shared loading-placeholder tests also cover the list factory.

### Example app

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
      marked as opened. Calling `storyManager.closeReaders()` closes the open reader.
- [ ] Reader controls follow `setCommonOptions`: like, dislike, favorite, share
      appear only when enabled.
- [ ] Sound toggle: `defaultMuted: true` opens the reader muted;
      `changeSound(true)` unmutes at runtime.
- [ ] `BannerCarousel` and `BannerGrid` render; grid height follows
      `widgetHeight`, refresh works, and banner events arrive in JS.
- [ ] `BannerList` uses internal vertical scrolling within its RN viewport:
      check `height`, `style.height`, flex, resizing/rotation and empty content.
      The viewport never follows `onPlaceLoaded` content height. Scroll through
      mixed-ratio banners and a place with more than 20 available banners.
- [ ] List appearance: side/leading/trailing insets (including explicit zero),
      spacing, radius on newly attached and recycled cards, and configured loader.
      Two lists with different settings must remain independent.
- [ ] List commands: refresh, pause/resume, appearance/place changes, detach/remount
      and app background/foreground. Manual pause persists; scrolling and taps
      still work while paused. No stale events after a place change or unmount.
      Refresh and switch list/grid while loading, then wait for a delayed load
      failure: neither the active nor the disposed widget may crash the app.
- [ ] List loaded callback: Android reports height `0`, iOS reports full content
      height, empty results report `(0, 0)`. Load failures are logged/reported,
      not presented as a successful empty result. Banner widget events and actions
      reach the existing JS subscriptions. Recheck grid and carousel afterward.
- [ ] Android grid: all rows and gaps are visible from a zero/loading host height;
      warm-cache loading and explicit refresh report a positive measured height.
      Empty places report `(0, 0)` rather than SDK layout constants (`-1`/`-2`).
- [ ] Android grid: updating only height/style does not reload content; changing
      width or insets recomputes row sizes, unchanged layouts do not repeat
      `onPlaceLoaded`, and leaving/changing the place during loading causes no
      stale height updates. On iOS, grid and carousel prop updates do not reload
      unchanged configurations; detached views pause and stale callbacks stop.
- [ ] Targeted single-story and IAM calls honor server targeting; `undefined`
      tags use SDK settings and `[]` sends an empty tag list.
- [ ] Story-reader, IAM, and banner loaders use their configured colors;
      omitted/reset surfaces fall back to the SDK placeholder. Invalid colors
      are logged and ignored without crashing Android.
- [ ] Favorites: favorite a story → it appears in the favorites feed →
      `removeAllFavorites()` empties it.
- [ ] Games: `preloadGames()` then `showGame(id)` opens and closes cleanly.
- [ ] In-app messages: `showIAMById` and `showIAMByEvent` display and close.
      A targeted IAM that fails to open resolves false; invalid string IDs
      resolve false on Android, and Activity recreation does not crash.
- [ ] IAM with a text input: focus the field, type and submit; the keyboard must
      not cover it on Android API 35, and closing the IAM restores the host
      window's original soft-input mode. On iOS, verify the default input
      presenter keeps the field visible above the keyboard and respects safe area.
- [ ] Onboarding: `showOnboardings()` shows unseen stories only.
- [ ] Goods / product cart: the widget calls back into `getGoods`, the cart
      handlers answer, and the reader shows the returned items.
- [ ] CTA: a story button with a deeplink reaches `storyLinkClickHandler`;
      without a handler the OS opens the URL.
- [ ] Logger: `setLoggingEnabled(true)` + `onLog(console.log)` then open a feed →
      `{level, message}` entries reach JS; `setLoggingEnabled(false)` stops the
      stream. Check both iOS and Android emit the same shape.

### Lifecycle and state (the regressions that hurt)

- [ ] `setApiKey` mid-session reinitializes with the current config;
      `setSendStatistics` changes statistics at runtime without reinitializing.
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
