/// <reference types="jest" />
import {
  getCardGeometry,
  getCardSidePadding,
} from '../components/StoriesList/cardGeometry';

const border = { width: 2, gap: 3 };

describe('getCardGeometry', () => {
  it('derives the card box from height and aspect ratio', () => {
    const geometry = getCardGeometry({
      size: 100,
      aspectRatio: 0.75,
      isCircle: false,
      border,
    });

    expect(geometry.width).toBe(75);
    expect(geometry.height).toBe(100);
  });

  it('insets the cover by both border gaps and the border itself', () => {
    const geometry = getCardGeometry({
      size: 100,
      aspectRatio: 1,
      isCircle: false,
      border,
    });

    // 100 - (3 * 2 + 2)
    expect(geometry.mediaWidth).toBe(92);
    expect(geometry.mediaHeight).toBe(92);
  });

  it('leaves the cover at full size when there is no border', () => {
    const geometry = getCardGeometry({
      size: 60,
      aspectRatio: 1,
      isCircle: false,
      border: { width: 0, gap: 0 },
    });

    expect(geometry.mediaWidth).toBe(60);
    expect(geometry.mediaHeight).toBe(60);
  });

  it('rounds a circle card by its full height', () => {
    const geometry = getCardGeometry({
      size: 80,
      aspectRatio: 1,
      isCircle: true,
      border,
    });

    expect(geometry.coverRadius).toBe(80);
  });

  it('uses the fixed radius for non-circle cards', () => {
    const geometry = getCardGeometry({
      size: 80,
      aspectRatio: 1,
      isCircle: false,
      border,
    });

    expect(geometry.coverRadius).toBe(10);
  });

  it('grows the border radius by the border gap', () => {
    const geometry = getCardGeometry({
      size: 80,
      aspectRatio: 1,
      isCircle: false,
      border,
    });

    expect(geometry.borderRadius).toBe(geometry.coverRadius + border.gap);
  });

  it('derives width from size * aspectRatio for extreme ratios', () => {
    const wide = getCardGeometry({
      size: 100,
      aspectRatio: 2.5,
      isCircle: false,
      border,
    });
    expect(wide.width).toBe(250);
    expect(wide.height).toBe(100);

    const tall = getCardGeometry({
      size: 100,
      aspectRatio: 0.4,
      isCircle: false,
      border,
    });
    expect(tall.width).toBe(40);
    expect(tall.height).toBe(100);
  });
});

describe('getCardSidePadding', () => {
  const sidePadding = 16;

  it('insets the first card on the leading edge', () => {
    expect(
      getCardSidePadding({
        isThumbnail: false,
        isFirstItem: true,
        isLastItem: false,
        sidePadding,
      })
    ).toEqual({ paddingLeft: 16, paddingRight: 0 });
  });

  it('insets the last card on the trailing edge', () => {
    expect(
      getCardSidePadding({
        isThumbnail: false,
        isFirstItem: false,
        isLastItem: true,
        sidePadding,
      })
    ).toEqual({ paddingLeft: 0, paddingRight: 16 });
  });

  it('leaves cards in the middle flush', () => {
    expect(
      getCardSidePadding({
        isThumbnail: false,
        isFirstItem: false,
        isLastItem: false,
        sidePadding,
      })
    ).toEqual({ paddingLeft: 0, paddingRight: 0 });
  });

  it('insets a lone card on the leading edge only', () => {
    expect(
      getCardSidePadding({
        isThumbnail: false,
        isFirstItem: true,
        isLastItem: true,
        sidePadding,
      })
    ).toEqual({ paddingLeft: 16, paddingRight: 0 });
  });

  it('gives favorites thumbnails a fixed gutter, ignoring the list padding', () => {
    expect(
      getCardSidePadding({
        isThumbnail: true,
        isFirstItem: true,
        isLastItem: false,
        sidePadding,
      })
    ).toEqual({ paddingLeft: 2, paddingRight: 2 });
  });
});
