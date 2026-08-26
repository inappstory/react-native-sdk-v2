import { useMemo } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { applyPlaceholders } from '../../utils/applyPlaceholders';

export type CardTitlePosition =
  'cardInsideBottom' | 'cardOutsideTop' | 'cardOutsideBottom';

export type CardTitleOptions = {
  display?: boolean;
  textAlign?: TextStyle['textAlign'];
  padding?: TextStyle;
  color?: string;
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  fontFamily?: string;
  lineHeight?: number;
  lineClamp?: number;
  position?: CardTitlePosition;
};

type StoryCellTitleProps = {
  title: string;
  storyTitleColor: string;
  width: number;
  options: CardTitleOptions;
  placeholders?: Record<string, string> | null;
};

const resolveColor = (storyTitleColor: string, themeColor?: string) =>
  !themeColor || storyTitleColor !== '#ffffff' ? storyTitleColor : themeColor;

export const StoryCellTitle = ({
  title,
  storyTitleColor,
  width,
  options,
  placeholders,
}: StoryCellTitleProps) => {
  const isInsideBottom = options.position === 'cardInsideBottom';

  const style = useMemo(
    () =>
      StyleSheet.create({
        title: {
          width,
          textAlign: options.textAlign || 'center',
          ...options.padding,
          color: resolveColor(storyTitleColor, options.color),
          fontSize: options.fontSize,
          fontWeight: options.fontWeight,
          fontFamily: options.fontFamily,
          lineHeight: options.lineHeight,
          position: isInsideBottom ? 'absolute' : 'relative',
          bottom: isInsideBottom ? 0 : 'auto',
        },
      }).title,
    [width, storyTitleColor, options, isInsideBottom]
  );

  return (
    <Text numberOfLines={options.lineClamp} ellipsizeMode="tail" style={style}>
      {applyPlaceholders(title, placeholders)}
    </Text>
  );
};
