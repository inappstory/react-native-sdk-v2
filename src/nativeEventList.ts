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
  'finishGame',
  'closeGame',
  'eventGame',
  'gameFailure',
  'gameReaderWillShow',
  'gameReaderDidClose',
  'gameComplete',
];
const storyListEvents = ['storyListUpdate', 'storyUpdate', 'favoritesUpdate'];
const goodsEvents = ['getGoodsObject'];
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
  ...goodsEvents,
  ...systemEvents,
];
