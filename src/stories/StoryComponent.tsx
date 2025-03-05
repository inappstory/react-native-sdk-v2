import * as React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import { AppearanceManager, type Story, StoryManager } from '../index';

export const StoryComponent = ({
  story,
  appearanceManager,
  storyManager,
  onPress,
  cellSize,
  hideTitle,
  renderCell,
  hideBorder,
  isFirstItem = false,
  isLastItem = false,
}: {
  story: any;
  appearanceManager: AppearanceManager;
  storyManager: StoryManager;
  onPress: any;
  cellSize?: any;
  hideTitle?: any;
  renderCell?: (
    story: Story,
    options: { isFirstItem: boolean; isLastItem: boolean }
  ) => React.JSX.Element;
  hideBorder?: any;
  isFirstItem?: boolean;
  isLastItem?: boolean;
}) => {
  const size = cellSize || appearanceManager?.storiesListOptions.card.height;
  const borderRadius =
    appearanceManager?.storiesListOptions.card.variant === 'circle' ? size : 10;
  const cardOpenedStyles = story.opened
    ? appearanceManager?.storiesListOptions.card.opened
    : appearanceManager?.storiesListOptions.card;
  const storyWidth =
    size *
    (appearanceManager?.storiesListOptions.card.aspectRatio ??
      story.aspectRatio);
  const storyHeight = size;

  const mediaWidth =
    storyWidth -
    (cardOpenedStyles.border.gap * 2 + cardOpenedStyles.border.width);
  const mediaHeight =
    storyHeight -
    (cardOpenedStyles.border.gap * 2 + cardOpenedStyles.border.width);

  const styles = StyleSheet.create({
    coverOverlay: {
      width: mediaWidth,
      height: mediaHeight,
      borderRadius: borderRadius,
      backgroundColor:
        appearanceManager?.storiesListOptions.card.mask.color ?? 'transparent',
      position: 'absolute',
    },
    cover: {
      backgroundColor: story.backgroundColor,
      width: mediaWidth,
      height: mediaHeight,
      borderRadius: borderRadius,
    },
    title: {
      textAlign:
        appearanceManager?.storiesListOptions.card.title.textAlign || 'center',
      ...appearanceManager?.storiesListOptions.card.title.padding,
      width: storyWidth,
      //backgroundColor: 'rgba(255,255,255,0.1)',
    },
  });

  const coverOverlay = <View style={styles.coverOverlay} />;

  const cover = story.coverVideoPath ? (
    <View style={[styles.cover, { borderRadius }]}>
      <Video
        source={{
          uri: (Platform.OS === 'android' ? '' : '') + story?.coverVideoPath,
        }}
        style={[styles.cover, { borderRadius, overflow: 'hidden' }]}
        repeat={true}
        volume={0}
        resizeMode={'cover'}
        paused={false}
        playInBackground={true}
        playWhenInactive={true}
        // only TextureView allow to be animated, transformed or scaled
        // need for set card.opened.opacity 0.5 for instance
        useTextureView={true}
        disableFocus={true}
      />
      {coverOverlay}
    </View>
  ) : story.coverImagePath ? (
    <View style={[styles.cover, { borderRadius }]}>
      <Image
        resizeMode={'cover'}
        source={{
          uri:
            (Platform.OS == 'android' ? 'file://' : '') + story?.coverImagePath,
        }}
        style={[styles.cover, { borderRadius }]}
      />
      {coverOverlay}
    </View>
  ) : (
    <View style={styles.cover}>{coverOverlay}</View>
  );

  let title = story.title;
  if (storyManager.placeholders) {
    Object.keys(storyManager.placeholders).map((placeholder) => {
      title = title.replace(
        `%${placeholder}%`,
        storyManager.placeholders[placeholder]
      );
    });
  }
  if (renderCell) {
    return (
      <Pressable onPress={() => onPress(story)}>
        {renderCell(story, { isFirstItem, isLastItem })}
      </Pressable>
    );
  }

  const cardOutsideBottom =
    appearanceManager?.storiesListOptions.card.title.position ==
    'cardOutsideBottom';
  const cardOutsideTop =
    appearanceManager?.storiesListOptions.card.title.position ==
    'cardOutsideTop';
  const cardInsideBottom =
    appearanceManager?.storiesListOptions.card.title.position ==
    'cardInsideBottom';
  const titleBox = !hideTitle ? (
    <Text
      numberOfLines={appearanceManager?.storiesListOptions.card.title.lineClamp}
      ellipsizeMode="tail"
      style={[
        styles.title,
        {
          color:
            !appearanceManager?.storiesListOptions.card.title.color ||
            story.titleColor !== '#ffffff'
              ? story.titleColor
              : appearanceManager?.storiesListOptions.card.title.color,
          fontSize: appearanceManager?.storiesListOptions.card.title.fontSize,
          fontWeight:
            appearanceManager?.storiesListOptions.card.title.fontWeight,
          fontFamily:
            appearanceManager?.storiesListOptions.card.title.fontFamily,
          lineHeight:
            appearanceManager?.storiesListOptions.card.title.lineHeight,
          // height: appearanceManager?.storiesListOptions.card.title.lineHeight * appearanceManager?.storiesListOptions.card.title.lineClamp,
          position: cardInsideBottom ? 'absolute' : 'relative',
          bottom: cardInsideBottom ? 0 : 'auto',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          height: cellSize,
        },
      ]}
    >
      {title}
    </Text>
  ) : null;

  let paddingLeft = 0;
  let paddingRight = 0;
  if (!cellSize) {
    if (isFirstItem) {
      paddingLeft = appearanceManager?.storiesListOptions.sidePadding;
    } else if (isLastItem) {
      paddingRight = appearanceManager?.storiesListOptions.sidePadding;
    }
  } else {
    paddingLeft = paddingRight = 2;
  }

  return (
    <Pressable
      style={{
        // height: appearanceManager?.storiesListOptions.layout.storiesListInnerHeight ?? '100%',
        flexDirection: 'column',
        paddingLeft,
        paddingRight,
        opacity: cardOpenedStyles.opacity || 1,
        paddingTop: cellSize ? 1 : 0,
        paddingBottom: 0,
      }}
      onPress={() => onPress(story)}
    >
      {cardOutsideTop && titleBox}
      <View
        style={{
          borderWidth: !hideBorder ? cardOpenedStyles.border.width : 0,
          borderColor: cardOpenedStyles.border.color,
          width: storyWidth,
          height: storyHeight,
          borderRadius: borderRadius + cardOpenedStyles.border.gap,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {cover}
        {cardInsideBottom && titleBox}
      </View>
      {cardOutsideBottom && titleBox}
    </Pressable>
  );
};
