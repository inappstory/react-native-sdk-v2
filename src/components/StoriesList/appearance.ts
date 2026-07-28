import type { StyleProp, ViewStyle } from 'react-native';

import type { AppearanceManager } from '../../core/AppearanceManager';
import type { CardBorderOptions } from './cardGeometry';
import type { CardTitleOptions } from './StoryCellTitle';

/** Theme of a card in one state — a card has a closed and an opened one. */
export type CardStateOptions = {
  border?: CardBorderOptions & { color?: string };
  opacity?: number;
  mask?: { color?: string };
};

export type CardOptions = CardStateOptions & {
  height: number;
  gap?: number;
  aspectRatio?: number;
  variant?: 'circle' | 'quad' | 'rectangle';
  title: CardTitleOptions;
  opened?: CardStateOptions;
};

export type StoriesListAppearance = {
  card: CardOptions;
  favoriteCard?: { customStyles?: StyleProp<ViewStyle> };
  sidePadding: number;
  topPadding?: number;
  bottomPadding?: number;
};

/** Used when the theme leaves the border out entirely. */
export const NO_BORDER = { width: 0, gap: 0, color: 'transparent' } as const;

/**
 * `AppearanceManager.storiesListOptions` is an untyped deep-merged bag. This is
 * the shape the list actually reads out of it, once the manager has normalised
 * the CSS-ish values the host app passed in.
 */
export const getListAppearance = (
  appearanceManager: AppearanceManager
): StoriesListAppearance =>
  appearanceManager.storiesListOptions as StoriesListAppearance;

/** Picks the card theme matching the story's read state. */
export const getCardState = (
  card: CardOptions,
  isOpened: boolean
): CardStateOptions => (isOpened && card.opened) || card;
