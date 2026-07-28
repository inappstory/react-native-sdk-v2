/// <reference types="jest" />
import { AppearanceManager } from '../AppearanceManager';
import NativeAppearanceManager from '../NativeAppearanceManager';
import { CoverQuality } from '../data/Enum';

jest.mock('../NativeAppearanceManager', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    {
      get: (target: any, prop: string) => (target[prop] ??= jest.fn()),
    }
  ),
}));

const native = NativeAppearanceManager as jest.Mocked<
  typeof NativeAppearanceManager
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('defaults', () => {
  it('starts with every reader button enabled and nothing configured', () => {
    const manager = new AppearanceManager();
    expect(manager.hasLike).toBe(true);
    expect(manager.hasDislike).toBe(true);
    expect(manager.hasFavorites).toBe(true);
    expect(manager.hasShare).toBe(true);
    expect(manager.storiesListOptions).toBeNull();
    expect(manager.storyReaderOptions).toBeNull();
    expect(manager.storyFavoriteReaderOptions).toBeNull();
  });

  it('starts with all common options off so nothing leaks to native', () => {
    expect(new AppearanceManager().commonOptions).toEqual({
      hasFavorite: false,
      hasLike: false,
      hasLikeButton: false,
      hasDislikeButton: false,
      hasShare: false,
    });
  });
});

describe('setCommonOptions', () => {
  const options = {
    hasFavorite: true,
    hasLike: true,
    hasLikeButton: true,
    hasDislikeButton: false,
    hasShare: true,
  };

  it('pushes like/favorites/share to native', () => {
    new AppearanceManager().setCommonOptions(options);
    expect(native.setHasLike).toHaveBeenCalledWith(true);
    expect(native.setHasFavorites).toHaveBeenCalledWith(true);
    expect(native.setHasShare).toHaveBeenCalledWith(true);
  });

  it('skips coverQuality when it is not provided', () => {
    new AppearanceManager().setCommonOptions(options);
    expect(native.setCoverQuality).not.toHaveBeenCalled();
  });

  it('pushes coverQuality when provided', () => {
    new AppearanceManager().setCommonOptions({
      ...options,
      coverQuality: CoverQuality.HIGH,
    });
    expect(native.setCoverQuality).toHaveBeenCalledWith('high');
  });

  it('merges over previous options instead of replacing them', () => {
    const manager = new AppearanceManager().setCommonOptions(options);
    manager.setCommonOptions({ ...options, hasShare: false });
    expect(manager.commonOptions.hasLike).toBe(true);
    expect(manager.commonOptions.hasShare).toBe(false);
    expect(native.setHasShare).toHaveBeenLastCalledWith(false);
  });

  it('is chainable', () => {
    const manager = new AppearanceManager();
    expect(manager.setCommonOptions(options)).toBe(manager);
  });
});

describe('setStoryReaderOptions', () => {
  it('applies native defaults when options are empty', () => {
    new AppearanceManager().setStoryReaderOptions({});
    expect(native.setCloseButtonPosition).toHaveBeenCalledWith('right');
    expect(native.setScrollStyle).toHaveBeenCalledWith('cover');
    expect(native.setReaderCornerRadius).toHaveBeenCalledWith(0);
  });

  it('passes explicit values through', () => {
    new AppearanceManager().setStoryReaderOptions({
      closeButtonPosition: 'left' as any,
      scrollStyle: 'cube' as any,
      slideBorderRadius: 12,
    });
    expect(native.setCloseButtonPosition).toHaveBeenCalledWith('left');
    expect(native.setScrollStyle).toHaveBeenCalledWith('cube');
    expect(native.setReaderCornerRadius).toHaveBeenCalledWith(12);
  });

  it('keeps earlier values on a second partial call', () => {
    const manager = new AppearanceManager();
    manager.setStoryReaderOptions({ scrollStyle: 'cube' as any });
    manager.setStoryReaderOptions({ slideBorderRadius: 4 });
    expect(native.setScrollStyle).toHaveBeenLastCalledWith('cube');
    expect(native.setReaderCornerRadius).toHaveBeenLastCalledWith(4);
  });

  it('is chainable', () => {
    const manager = new AppearanceManager();
    expect(manager.setStoryReaderOptions({})).toBe(manager);
  });
});

describe('setStoryFavoriteReaderOptions', () => {
  it('merges partial title options', () => {
    const manager = new AppearanceManager();
    manager.setStoryFavoriteReaderOptions({ title: { content: 'Favorites' } });
    manager.setStoryFavoriteReaderOptions({ title: { color: '#fff' } });
    expect(manager.storyFavoriteReaderOptions.title).toEqual({
      content: 'Favorites',
      color: '#fff',
    });
  });
});

describe('setStoriesListOptions — card title padding', () => {
  const paddingOf = (options: any) =>
    new AppearanceManager().setStoriesListOptions(options).storiesListOptions
      .card.title.padding;

  it('expands a numeric padding to all four sides', () => {
    expect(paddingOf({ card: { title: { padding: 8 } } })).toEqual({
      paddingTop: 8,
      paddingRight: 8,
      paddingBottom: 8,
      paddingLeft: 8,
    });
  });

  it('parses css shorthand into per-side numbers', () => {
    expect(paddingOf({ card: { title: { padding: '10px 20px' } } })).toEqual({
      paddingTop: 10,
      paddingRight: 20,
      paddingBottom: 10,
      paddingLeft: 20,
    });
  });

  it('parses full four-side css shorthand in TRBL order', () => {
    expect(
      paddingOf({ card: { title: { padding: '1px 2px 3px 4px' } } })
    ).toEqual({
      paddingTop: 1,
      paddingRight: 2,
      paddingBottom: 3,
      paddingLeft: 4,
    });
  });

  it('defaults to zero padding without logging when the option is absent', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(paddingOf({})).toEqual({
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    });
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('creates the card.title branch when the list has no card options', () => {
    const options = new AppearanceManager().setStoriesListOptions({
      sidePadding: 10,
    }).storiesListOptions;
    expect(options.card.title.padding).toBeDefined();
    expect(options.sidePadding).toBe(10);
  });

  it('keeps the other card and title options while rewriting padding', () => {
    const options = new AppearanceManager().setStoriesListOptions({
      card: {
        aspectRatio: 1.5,
        variant: 'circle' as any,
        title: { padding: 4, color: '#fff' } as any,
      },
    }).storiesListOptions;
    expect(options.card.aspectRatio).toBe(1.5);
    expect(options.card.variant).toBe('circle');
    expect(options.card.title.color).toBe('#fff');
  });

  it('falls back to zeros and logs when padding cannot be parsed', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    // parse-css-sides throws on an empty string.
    expect(paddingOf({ card: { title: { padding: '' } } })).toEqual({
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('keeps other list options across successive merges', () => {
    const manager = new AppearanceManager();
    manager.setStoriesListOptions({ sidePadding: 5 });
    manager.setStoriesListOptions({ topPadding: 7 });
    expect(manager.storiesListOptions.sidePadding).toBe(5);
    expect(manager.storiesListOptions.topPadding).toBe(7);
  });
});

describe('native delegating setters', () => {
  it.each([
    ['setCoverQuality', ['high']],
    ['setReaderCornerRadius', [16]],
    ['setScrollStyle', ['flat']],
    ['setReaderBackgroundColor', ['#000']],
    ['setOverScrollToClose', [true]],
    ['setSwipeToClose', [false]],
    ['setTimerGradientEnable', [true]],
    ['setPresentationStyle', ['zoom']],
    ['setLikeImage', ['a', 'b']],
    ['setDislikeImage', ['a', 'b']],
    ['setFavoriteImage', ['a', 'b']],
    ['setShareImage', ['a', 'b']],
    ['setSoundImage', ['a', 'b']],
    ['setCloseReaderImage', ['a']],
    ['setRefreshImage', ['a']],
    ['setRefreshGoodsImage', ['a']],
    ['setCloseGoodsImage', ['a']],
  ] as const)('%s forwards to native unchanged', (method, args) => {
    (new AppearanceManager() as any)[method](...args);
    expect((native as any)[method]).toHaveBeenCalledWith(...args);
  });
});
