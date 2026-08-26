import { memo, useMemo } from 'react';
import { Pressable, View } from 'react-native';

import type { RenderCell } from '../../types/RenderCell';
import type { Story } from '../../types/Story';
import {
  getCardState,
  NO_BORDER,
  type StoriesListAppearance,
} from './appearance';
import { getCardGeometry, getCardSidePadding } from './cardGeometry';
import { StoryCellTitle } from './StoryCellTitle';
import { StoryCover } from './StoryCover';

export type StoryCellProps = {
  story: Story;
  listOptions: StoriesListAppearance;
  onPress: (story: Story, index?: number) => void;
  placeholders?: Record<string, string> | null;
  cardIndex?: number;
  cellSize?: number;
  hideTitle?: boolean;
  hideBorder?: boolean;
  renderCell?: RenderCell;
  isFirstItem?: boolean;
  isLastItem?: boolean;
};

const StoryCellView = ({
  story,
  listOptions,
  onPress,
  placeholders,
  cardIndex,
  cellSize,
  hideTitle = false,
  hideBorder = false,
  renderCell,
  isFirstItem = false,
  isLastItem = false,
}: StoryCellProps) => {
  const card = listOptions.card;
  const state = getCardState(card, story.opened);
  const border = state.border ?? NO_BORDER;

  const geometry = useMemo(
    () =>
      getCardGeometry({
        size: cellSize || card.height,
        aspectRatio: card.aspectRatio ?? story.aspectRatio,
        isCircle: card.variant === 'circle',
        border,
      }),
    [
      cellSize,
      card.height,
      card.aspectRatio,
      card.variant,
      story.aspectRatio,
      border,
    ]
  );

  const containerStyle = useMemo(
    () => ({
      flexDirection: 'column' as const,
      ...getCardSidePadding({
        isThumbnail: cellSize != null,
        isFirstItem,
        isLastItem,
        sidePadding: listOptions.sidePadding,
      }),
      opacity: state.opacity || 1,
      paddingTop: cellSize ? 1 : 0,
    }),
    [cellSize, isFirstItem, isLastItem, listOptions.sidePadding, state.opacity]
  );

  const borderStyle = useMemo(
    () => ({
      width: geometry.width,
      height: geometry.height,
      borderWidth: hideBorder ? 0 : border.width,
      borderColor: border.color,
      borderRadius: geometry.borderRadius,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    }),
    [geometry, hideBorder, border]
  );

  if (renderCell) {
    return (
      <Pressable onPress={() => onPress(story, cardIndex)}>
        {renderCell(story, { isFirstItem, isLastItem })}
      </Pressable>
    );
  }

  const title = hideTitle ? null : (
    <StoryCellTitle
      title={story.title}
      storyTitleColor={story.titleColor}
      width={geometry.width}
      options={card.title}
      placeholders={placeholders}
    />
  );

  const titlePosition = card.title.position;

  return (
    <Pressable style={containerStyle} onPress={() => onPress(story, cardIndex)}>
      {titlePosition === 'cardOutsideTop' && title}
      <View style={borderStyle}>
        <StoryCover
          videoPath={story.coverVideoPath}
          imagePath={story.coverImagePath}
          backgroundColor={story.backgroundColor}
          width={geometry.mediaWidth}
          height={geometry.mediaHeight}
          borderRadius={geometry.coverRadius}
          maskColor={card.mask?.color}
        />
        {titlePosition === 'cardInsideBottom' && title}
      </View>
      {titlePosition === 'cardOutsideBottom' && title}
    </Pressable>
  );
};

export const StoryCell = memo(StoryCellView);
StoryCell.displayName = 'StoryCell';
