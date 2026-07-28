import type { Story } from './Story';

export type RenderCell = (
  story: Story,
  options: { isFirstItem: boolean; isLastItem: boolean }
) => React.JSX.Element;

export type RenderFavoriteCell = (stories: Array<Story>) => React.JSX.Element;
