/**
 * Card layout math. Pure — no React, no native — so it can be unit tested
 * without rendering anything.
 */

/** Radius of a non-circle card cover, in px. */
const DEFAULT_COVER_RADIUS = 10;

/** Horizontal gutter of the thumbnails packed inside the favorites cell. */
const THUMBNAIL_GUTTER = 2;

export type CardBorderOptions = {
  width: number;
  gap: number;
};

export type CardGeometryInput = {
  /** Rendered card height, in px. */
  size: number;
  /** width / height of the card. */
  aspectRatio: number;
  /** Circle cards get a radius of a full card height, the rest a fixed one. */
  isCircle: boolean;
  border: CardBorderOptions;
};

export type CardGeometry = {
  width: number;
  height: number;
  /** Cover size — the card minus the border box drawn around it. */
  mediaWidth: number;
  mediaHeight: number;
  coverRadius: number;
  /** Radius of the border box itself, always the cover radius plus its gap. */
  borderRadius: number;
};

export function getCardGeometry({
  size,
  aspectRatio,
  isCircle,
  border,
}: CardGeometryInput): CardGeometry {
  const width = size * aspectRatio;
  const inset = border.gap * 2 + border.width;
  const coverRadius = isCircle ? size : DEFAULT_COVER_RADIUS;

  return {
    width,
    height: size,
    mediaWidth: width - inset,
    mediaHeight: size - inset,
    coverRadius,
    borderRadius: coverRadius + border.gap,
  };
}

export type CardSidePaddingInput = {
  /**
   * True for the thumbnails inside the favorites cell — they are laid out by
   * their container and take a fixed gutter instead of the list side padding.
   */
  isThumbnail: boolean;
  isFirstItem: boolean;
  isLastItem: boolean;
  sidePadding: number;
};

export function getCardSidePadding({
  isThumbnail,
  isFirstItem,
  isLastItem,
  sidePadding,
}: CardSidePaddingInput): { paddingLeft: number; paddingRight: number } {
  if (isThumbnail) {
    return { paddingLeft: THUMBNAIL_GUTTER, paddingRight: THUMBNAIL_GUTTER };
  }
  // First wins when a lone card is both first and last: the list is inset on
  // the leading edge only.
  if (isFirstItem) return { paddingLeft: sidePadding, paddingRight: 0 };
  if (isLastItem) return { paddingLeft: 0, paddingRight: sidePadding };
  return { paddingLeft: 0, paddingRight: 0 };
}
