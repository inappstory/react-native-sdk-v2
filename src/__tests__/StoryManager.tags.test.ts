/// <reference types="jest" />
import { native } from './helpers/storyManagerMocks';
import { StoryManager } from '../core/StoryManager';

describe('runtime setters', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it.each([
    ['setLang', ['ru-RU']],
    ['changeSound', [false]],
    ['setAppVersion', ['2.0', 10]],
    ['removeAllFavorites', []],
    ['logout', []],
    ['clearCache', []],
    ['preloadGames', []],
  ] as const)('%s calls through to native', (method, args) => {
    (manager as any)[method](...args);
    expect((native as any)[method]).toHaveBeenCalledWith(...args);
  });

  it('setOptions passes the options map to native', () => {
    manager.setOptions({ pos: '1' });
    expect(native.setOptions).toHaveBeenCalledWith({ pos: '1' });
  });

  it('addTags calls native and merges local tags without duplicates', async () => {
    const m = await StoryManager.create({
      apiKey: 'k',
      userId: 'u',
      tags: ['a'],
    });
    m.addTags(['a', 'b']);
    expect(native.addTags).toHaveBeenCalledWith(['a', 'b']);
    expect(m.tags).toEqual(['a', 'b']);
  });

  it('removeFromFavorite stringifies numeric ids', () => {
    manager.removeFromFavorite(15);
    expect(native.removeFromFavorite).toHaveBeenCalledWith('15');
  });

  it('favoritesCount resolves native value', async () => {
    await expect(manager.favoritesCount()).resolves.toBe(2);
  });

  it('favoritesCount returns 0 when native resolves 0', async () => {
    native.favoritesCount.mockResolvedValueOnce(0);
    await expect(manager.favoritesCount()).resolves.toBe(0);
  });

  it('setTags replaces local tags and calls native', async () => {
    const m = await StoryManager.create({
      apiKey: 'k',
      userId: 'u',
      tags: ['a'],
    });
    m.setTags(['sport', 'news']);
    expect(native.setTags).toHaveBeenCalledWith(['sport', 'news']);
    expect(m.tags).toEqual(['sport', 'news']);
  });

  it('removeTags removes specified tags from local state and calls native', async () => {
    const m = await StoryManager.create({
      apiKey: 'k',
      userId: 'u',
      tags: ['a', 'b', 'c'],
    });
    m.removeTags(['b']);
    expect(native.removeTags).toHaveBeenCalledWith(['b']);
    expect(m.tags).toEqual(['a', 'c']);
  });

  it('setPlaceholders and setImagePlaceholders pass empty objects to native', () => {
    manager.setPlaceholders({});
    manager.setImagePlaceholders({});
    expect(native.setPlaceholders).toHaveBeenCalledWith({});
    expect(native.setImagesPlaceholders).toHaveBeenCalledWith({});
  });
});

describe('feeds', () => {
  let manager: StoryManager;
  beforeEach(async () => {
    manager = await StoryManager.create({ apiKey: 'k', userId: 'u' });
  });

  it('createSubscriberList falls back to the feed name as uniqueId', async () => {
    await manager.createSubscriberList('main');
    expect(native.createSubscriberList).toHaveBeenCalledWith('main', 'main');
    await manager.createSubscriberList('main', 'list1');
    expect(native.createSubscriberList).toHaveBeenLastCalledWith(
      'main',
      'list1'
    );
  });

  it('fetchFeed and fetchFavorites delegate to native', async () => {
    await manager.fetchFeed('main', 'list1');
    await manager.fetchFavorites('main');
    expect(native.getStories).toHaveBeenCalledWith('main', 'list1');
    expect(native.getFavoriteStories).toHaveBeenCalledWith('main');
  });

  it('favoriteCellPressed refetches favorites and notifies the listener', () => {
    const listener = jest.fn();
    manager.onFavoriteCell(listener);
    manager.favoriteCellPressed('main');
    expect(native.onFavoriteCell).toHaveBeenCalled();
    expect(native.getFavoriteStories).toHaveBeenCalledWith('main');
    expect(listener).toHaveBeenCalled();
  });

  it('favoriteCellPressed does not throw when no listener is registered', () => {
    expect(() => manager.favoriteCellPressed('main')).not.toThrow();
    expect(native.getFavoriteStories).toHaveBeenCalledWith('main');
  });
});
