/// <reference types="jest" />
import { native, flush } from './helpers/storyManagerMocks';
import { StoryManager } from '../core/StoryManager';
import NativeFeedEvents from '../specs/NativeFeedEvents';
import NativeStoriesEvents from '../specs/NativeStoriesEvents';
import NativeBannerEvents from '../specs/NativeBannerEvents';
import NativeGoodsEvents from '../specs/NativeGoodsEvents';
import NativeSystemEvents from '../specs/NativeSystemEvents';
import NativeGameEvents from '../specs/NativeGameEvents';
import NativeIamEvents from '../specs/NativeIamEvents';

describe('StoryManager.create', () => {
  it('initializes native SDK with config values', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 42,
      userIdSign: 'sig',
      sendStatistics: false,
    });
    expect(native.initWith).toHaveBeenCalledWith(
      'key',
      '42',
      'sig',
      false,
      false,
      null,
      false,
      []
    );
  });

  it('rejects a userId longer than 255 bytes, counting UTF-8 bytes', async () => {
    // 128 two-byte chars = 256 bytes, still 128 JS characters
    await expect(
      StoryManager.create({ apiKey: 'key', userId: '\u00e9'.repeat(128) })
    ).rejects.toThrow('userId must be at most 255 bytes, got 256');
    expect(native.initWith).not.toHaveBeenCalled();
  });

  it('accepts a userId of exactly 255 bytes', async () => {
    await StoryManager.create({ apiKey: 'key', userId: 'a'.repeat(255) });
    expect(native.initWith).toHaveBeenCalled();
  });

  it('passes cacheSize and anonymous to native init', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 'u',
      cacheSize: 'large',
      anonymous: true,
    });
    expect(native.initWith).toHaveBeenCalledWith(
      'key',
      'u',
      null,
      false,
      true,
      'large',
      true,
      []
    );
  });

  it('applies tags, placeholders, lang and appVersion from config', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 'u',
      tags: ['a', 'b'],
      placeholders: { name: 'Alex' },
      lang: 'ru-RU',
      appVersion: { version: '1.2.3', build: 45 },
    });
    expect(native.initWith).toHaveBeenCalledWith(
      'key',
      'u',
      null,
      false,
      true,
      null,
      false,
      ['a', 'b']
    );
    expect(native.setTags).not.toHaveBeenCalled();
    expect(native.setPlaceholders).toHaveBeenCalledWith({ name: 'Alex' });
    expect(native.setLang).toHaveBeenCalledWith('ru-RU');
    expect(native.setAppVersion).toHaveBeenCalledWith('1.2.3', 45);
  });

  it('does not push absent config values but always applies sound', async () => {
    await StoryManager.create({ apiKey: 'key', userId: 'u' });
    expect(native.setTags).not.toHaveBeenCalled();
    expect(native.setPlaceholders).not.toHaveBeenCalled();
    expect(native.setImagesPlaceholders).not.toHaveBeenCalled();
    expect(native.setLang).not.toHaveBeenCalled();
    expect(native.setAppVersion).not.toHaveBeenCalled();
    expect(native.changeSound).toHaveBeenCalledWith(true);
  });

  it('keeps the empty defaults when the config omits placeholders and lang', async () => {
    const manager = await StoryManager.create({ apiKey: 'key', userId: 'u' });
    expect(manager.placeholders).toBe('');
    expect(manager.lang).toBe('');
  });

  it('sends an empty userId when the config has none', async () => {
    await StoryManager.create({ apiKey: 'key' });
    expect(native.initWith).toHaveBeenCalledWith(
      'key',
      '',
      null,
      false,
      true,
      null,
      false,
      []
    );
  });

  it('starts with empty tags and sound on', async () => {
    const manager = await StoryManager.create({ apiKey: 'key' });
    expect(manager.tags).toEqual([]);
    expect(manager.soundEnabled).toBe(true);
    expect(manager.userIdSign).toBeNull();
    expect(manager.appVersion).toBeNull();
  });

  it('maps defaultMuted to changeSound(false)', async () => {
    await StoryManager.create({
      apiKey: 'key',
      userId: 'u',
      defaultMuted: true,
    });
    expect(native.changeSound).toHaveBeenCalledWith(false);
  });

  it('sets up all native event modules', async () => {
    await StoryManager.create({ apiKey: 'key', userId: 'u' });
    expect(NativeFeedEvents.setupFeedEvents).toHaveBeenCalled();
    expect(NativeStoriesEvents.setupStoriesEvents).toHaveBeenCalled();
    expect(NativeBannerEvents.setupBannerEvents).toHaveBeenCalled();
    expect(NativeGoodsEvents.setupGoodsEvents).toHaveBeenCalled();
    expect(NativeSystemEvents.setupSystemEvents).toHaveBeenCalled();
    expect(NativeGameEvents.setupGameEvents).toHaveBeenCalled();
    expect(NativeIamEvents.setupIamEvents).toHaveBeenCalled();
  });
});

describe('reinit', () => {
  it('setApiKey replays the whole config onto native', async () => {
    const manager = await StoryManager.create({
      apiKey: 'old',
      userId: 'u',
      tags: ['a'],
      lang: 'ru',
    });
    native.initWith.mockClear();
    manager.setApiKey('new');
    await flush();
    expect(native.initWith).toHaveBeenCalledWith(
      'new',
      'u',
      null,
      false,
      true,
      null,
      false,
      ['a']
    );
    // tags and lang must survive the native state reset
    expect(native.setLang).toHaveBeenLastCalledWith('ru');
  });

  it('setSendStatistics reinits with the new flag', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.setSendStatistics(false);
    await flush();
    expect(native.initWith).toHaveBeenLastCalledWith(
      'k',
      'u',
      null,
      false,
      false,
      null,
      false,
      []
    );
  });

  it('logs instead of throwing when reinit fails', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    native.initWith.mockRejectedValueOnce(new Error('native down'));
    expect(() => manager.setApiKey('new')).not.toThrow();
    await flush();
    expect(error).toHaveBeenCalledWith(
      'InAppStory: reinit failed',
      expect.any(Error)
    );
    error.mockRestore();
  });

  it('replays image placeholders set at runtime', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.setImagePlaceholders({ img: 'url' });
    native.setImagesPlaceholders.mockClear();
    manager.setApiKey('new');
    await flush();
    expect(native.setImagesPlaceholders).toHaveBeenCalledWith({ img: 'url' });
  });

  it('replays runtime setter values, not the original config', async () => {
    const manager = await StoryManager.create({
      apiKey: 'k',
      userId: 'u',
      lang: 'ru',
    });
    manager.setLang('en');
    manager.changeSound(false);
    manager.setApiKey('new');
    await flush();
    expect(native.setLang).toHaveBeenLastCalledWith('en');
    expect(native.changeSound).toHaveBeenLastCalledWith(false);
  });

  it('reinit after logout resets internal state and calls initWith cleanly', async () => {
    const manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
    manager.logout();
    native.initWith.mockClear();
    manager.setApiKey('new');
    await flush();
    expect(native.initWith).toHaveBeenCalledWith(
      'new',
      'u',
      null,
      false,
      true,
      null,
      false,
      []
    );
  });
});

describe('local state kept in sync for reinit', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({
      apiKey: 'k',
      userId: 'u',
      tags: ['a', 'b'],
    });
  });

  it('setTags replaces the local list', () => {
    manager.setTags(['x']);
    expect(manager.tags).toEqual(['x']);
    expect(native.setTags).toHaveBeenLastCalledWith(['x']);
  });

  it('removeTags drops only the listed tags', () => {
    manager.removeTags(['a', 'missing']);
    expect(manager.tags).toEqual(['b']);
    expect(native.removeTags).toHaveBeenCalledWith(['a', 'missing']);
  });

  it('setLang / changeSound / setAppVersion update local fields', () => {
    manager.setLang('en');
    manager.changeSound(false);
    manager.setAppVersion('3.0', 7);
    expect(manager.lang).toBe('en');
    expect(manager.soundEnabled).toBe(false);
    expect(manager.appVersion).toEqual({ version: '3.0', build: 7 });
  });

  it('setPlaceholders and setImagePlaceholders push and store', () => {
    manager.setPlaceholders({ a: '1' });
    manager.setImagePlaceholders({ b: '2' });
    expect(native.setPlaceholders).toHaveBeenCalledWith({ a: '1' });
    expect(native.setImagesPlaceholders).toHaveBeenCalledWith({ b: '2' });
    expect(manager.placeholders).toEqual({ a: '1' });
    expect(manager.imagePlaceholders).toEqual({ b: '2' });
  });

  it('setUserId delegates without touching the stored id', () => {
    manager.setUserId('u2', 'sign');
    expect(native.setUserID).toHaveBeenCalledWith('u2', 'sign');
  });

  it('initWith drops tags assigned directly on the instance when invalid', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.tags = ['ok', 'bad tag'];
    native.initWith.mockClear();
    manager.setApiKey('k2');
    await Promise.resolve();
    expect(native.initWith).toHaveBeenCalledWith(
      'k2',
      expect.anything(),
      null,
      false,
      true,
      null,
      false,
      []
    );
    expect(error).toHaveBeenCalledWith(
      'InAppStory: tag "bad tag" is invalid, only letters, digits, underscores and dashes are allowed'
    );
    error.mockRestore();
  });

  it('setTags reports a tag with characters outside letters, digits, _ and - and skips native', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.setTags(['ok']);
    native.setTags.mockClear();
    manager.setTags(['ok', 'bad tag']);
    expect(native.setTags).not.toHaveBeenCalled();
    expect(manager.tags).toEqual(['ok']);
    expect(error).toHaveBeenCalledWith(
      'InAppStory: tag "bad tag" is invalid, only letters, digits, underscores and dashes are allowed'
    );
    error.mockRestore();
  });

  it('setTags accepts letters from non-latin scripts', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.setTags(['спорт', '新闻', 'tag_1-2']);
    expect(native.setTags).toHaveBeenCalledWith(['спорт', '新闻', 'tag_1-2']);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('setTags rejects an emoji tag', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.setTags(['🔥']);
    expect(native.setTags).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      'InAppStory: tag "🔥" is invalid, only letters, digits, underscores and dashes are allowed'
    );
    error.mockRestore();
  });

  it('setTags reports tags larger than 4096 bytes in total and skips native', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.setTags(['a'.repeat(4096)]);
    expect(native.setTags).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      'InAppStory: tags must be at most 4096 bytes in total, got 4097'
    );
    error.mockRestore();
  });

  it('setTags accepts exactly 4096 bytes in total', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.setTags(['a'.repeat(4095)]);
    expect(native.setTags).toHaveBeenCalledWith(['a'.repeat(4095)]);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('setTags counts cyrillic tags as 2 UTF-8 bytes per character', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    // 'я' x 2048 = 4096 bytes, plus the separator that overflows the budget.
    manager.setTags(['я'.repeat(2048)]);
    expect(native.setTags).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      'InAppStory: tags must be at most 4096 bytes in total, got 4097'
    );
    error.mockRestore();
  });

  it('addTags keeps the local tags when the merged list exceeds the limit', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    manager.setTags(['a'.repeat(4000)]);
    manager.addTags(['b'.repeat(96)]);
    expect(native.addTags).not.toHaveBeenCalled();
    expect(manager.tags).toEqual(['a'.repeat(4000)]);
    expect(error).toHaveBeenCalledWith(
      'InAppStory: tags must be at most 4096 bytes in total, got 4098'
    );
    error.mockRestore();
  });

  it('preloadIAM rejects invalid tags without calling native', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(manager.preloadIAM(['id'], ['bad tag'])).rejects.toBe(false);
    expect(native.preloadIAM).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('setUserId rejects an id longer than 255 bytes', () => {
    expect(() => manager.setUserId('a'.repeat(256), null)).toThrow(
      'userId must be at most 255 bytes, got 256'
    );
    expect(native.setUserID).not.toHaveBeenCalled();
  });
});
