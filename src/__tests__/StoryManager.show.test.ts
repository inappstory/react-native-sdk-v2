/// <reference types="jest" />
import { native } from './helpers/storyManagerMocks';
import { StoryManager } from '../core/StoryManager';
import NativeAppearanceManager from '../specs/NativeAppearanceManager';

describe('cancelable operations', () => {
  it('showStory resolves loaded=true and passes stringified id', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await expect(manager.showStory(7)).resolves.toEqual({ loaded: true });
    expect(native.showSingle).toHaveBeenCalledWith('7', expect.any(String));
  });

  it('showStory aborts pending open via cancelOperation', async () => {
    native.showSingle.mockReturnValueOnce(new Promise(() => {}));
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const controller = new AbortController();
    const promise = manager.showStory(1, controller.signal);
    controller.abort();
    await expect(promise).rejects.toEqual({ loaded: false });
    const operationId = native.showSingle.mock.calls[0]![1];
    expect(native.cancelOperation).toHaveBeenCalledWith(operationId);
  });

  it('rejects immediately when signal is already aborted', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const controller = new AbortController();
    controller.abort();
    await expect(
      manager.showIAMById('5', false, controller.signal)
    ).rejects.toBe(false);
    expect(native.showIAMById).not.toHaveBeenCalled();
  });

  it('stops listening to the signal once the operation finished', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const controller = new AbortController();
    await manager.showStory(1, controller.signal);
    controller.abort();
    expect(native.cancelOperation).not.toHaveBeenCalled();
  });

  it('showStoryOnce resolves native result and stringifies id', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await expect(manager.showStoryOnce(9)).resolves.toBe(true);
    expect(native.showStoryOnce).toHaveBeenCalledWith('9', expect.any(String));
  });

  it('showOnboardings uses native defaults and supports overrides', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await manager.showOnboardings();
    expect(native.showOnboardings).toHaveBeenCalledWith(
      'onboarding',
      1000,
      null,
      expect.any(String)
    );
    await manager.showOnboardings('welcome', 3, ['vip']);
    expect(native.showOnboardings).toHaveBeenCalledWith(
      'welcome',
      3,
      ['vip'],
      expect.any(String)
    );
  });
});

describe('promise rejection paths', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it('showStory rejects with loaded=false when native reports failure', async () => {
    native.showSingle.mockResolvedValueOnce(false);
    await expect(manager.showStory(1)).rejects.toEqual({ loaded: false });
  });

  it('showStoryOnce rejects with false when native reports failure', async () => {
    native.showStoryOnce.mockResolvedValueOnce(false);
    await expect(manager.showStoryOnce(1)).rejects.toBe(false);
  });

  it('preloadBannerPlace throws false when native returns false', async () => {
    native.preloadBannerPlace.mockResolvedValueOnce(false);
    await expect(manager.preloadBannerPlace('place')).rejects.toBe(false);
  });

  it('preloadBannerPlace passes null tags by default', async () => {
    await expect(manager.preloadBannerPlace('place')).resolves.toBe(true);
    expect(native.preloadBannerPlace).toHaveBeenCalledWith('place', null);
    await manager.preloadBannerPlace('place', ['vip']);
    expect(native.preloadBannerPlace).toHaveBeenLastCalledWith('place', [
      'vip',
    ]);
  });

  it('preloadIAM throws false when native returns false', async () => {
    native.preloadIAM.mockResolvedValueOnce(false);
    await expect(manager.preloadIAM()).rejects.toBe(false);
  });

  it('preloadIAM normalizes missing ids and tags to null', async () => {
    await expect(manager.preloadIAM()).resolves.toBe(true);
    expect(native.preloadIAM).toHaveBeenCalledWith(null, null);
  });

  it('showIAMByEvent forwards event, onlyPreloaded and an operationId', async () => {
    await expect(manager.showIAMByEvent('promo', true)).resolves.toBe(true);
    expect(native.showIAMByEvent).toHaveBeenCalledWith(
      'promo',
      true,
      expect.any(String)
    );
  });

  it.each([
    ['showOnboardings', () => manager.showOnboardings(), 'showOnboardings'],
    ['showIAMById', () => manager.showIAMById('1', false), 'showIAMById'],
    [
      'showIAMByEvent',
      () => manager.showIAMByEvent('e', false),
      'showIAMByEvent',
    ],
  ] as const)(
    '%s rejects with false on native failure',
    async (_n, call, nativeName) => {
      (native as any)[nativeName].mockResolvedValueOnce(false);
      await expect(call()).rejects.toBe(false);
    }
  );

  it('showIAMById forwards id, onlyPreloaded and an operationId', async () => {
    await expect(manager.showIAMById('5', true)).resolves.toBe(true);
    expect(native.showIAMById).toHaveBeenCalledWith(
      '5',
      true,
      expect.any(String)
    );
  });

  it('showGame delegates straight to native without an operationId', async () => {
    await expect(manager.showGame('g1')).resolves.toBe(true);
    expect(native.showGame).toHaveBeenCalledWith('g1');
  });

  it('showGame resolves false when native reports failure', async () => {
    native.showGame.mockResolvedValueOnce(false);
    await expect(manager.showGame('g1')).resolves.toBe(false);
  });

  it('gives every cancelable operation its own id', async () => {
    await manager.showStory(1);
    await manager.showStory(2);
    const [first, second] = native.showSingle.mock.calls.map((c) => c[1]);
    expect(first).not.toBe(second);
  });
});

describe('story reader appearance overrides', () => {
  it('pushes button visibility to native when hasLike is on', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const appearance: any = {
      commonOptions: {
        hasLike: true,
        hasLikeButton: true,
        hasFavorite: true,
        hasShare: false,
      },
    };
    await manager.showStory(1, null, appearance);
    expect(NativeAppearanceManager.setHasLike).toHaveBeenCalledWith(true);
    expect(NativeAppearanceManager.setHasFavorites).toHaveBeenCalledWith(true);
    expect(NativeAppearanceManager.setHasShare).toHaveBeenCalledWith(false);
  });

  it('leaves native appearance alone when hasLike is off', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await manager.showStory(1, null, {
      commonOptions: { hasLike: false },
    } as any);
    expect(NativeAppearanceManager.setHasLike).not.toHaveBeenCalled();
  });

  it('leaves native appearance alone when no manager is passed', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    await manager.showStory(1);
    expect(NativeAppearanceManager.setHasLike).not.toHaveBeenCalled();
  });
});
