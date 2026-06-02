const storiesEvents = [
  'storiesLoaded',
  'ugcStoriesLoaded',
  'showStory',
  'closeStory',
  'showSlide',
  'likeStory',
  'dislikeStory',
  'favoriteStory',
  'clickOnShareStory',
  'storyWidgetEvent',
];
const gameEvents = [
  'startGame',
  'closeGame',
  'eventGame',
  'gameFailure',
  'gameReaderWillShow',
  'gameReaderDidClose',
  'gameComplete',
];
const iamEvents = [
  'showInAppMessage',
  'closeInAppMessage',
  'inAppMessageWidgetEvent',
];
const storyListEvents = ['storyListUpdate', 'storyUpdate', 'favoritesUpdate'];
const goodsEvents = ['getGoodsObject'];
const bannerEvents = ['bannerWidgetEvent'];
const systemEvents = [
  'storyReaderWillShow',
  'storyReaderDidClose',
  'sessionFailure',
  'storyFailure',
  'currentStoryFailure',
  'networkFailure',
  'requestFailure',
  'favoriteCellDidSelect',
  'editorCellDidSelect',
  'customShare',
  'onActionWith',
  'storiesDidUpdated',
  'goodItemSelected',
  'favoritesUpdate',
  'scrollUpdate',
  'handleCTA',
];

export const nativeEventList = [
  ...storiesEvents,
  ...gameEvents,
  ...storyListEvents,
  ...iamEvents,
  ...goodsEvents,
  ...systemEvents,
  ...bannerEvents,
];
