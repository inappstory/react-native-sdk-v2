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

export const StoryComponent = ({
  story,
  appearanceManager,
  storyManager,
  onPress,
  cellSize,
  hideTitle,
  renderCell,
  hideBorder,
}: {
  story: any;
  appearanceManager: any;
  storyManager: any;
  onPress: any;
  cellSize?: any;
  hideTitle?: any;
  renderCell?: any;
  hideBorder?: any;
}) => {
  const size = cellSize || appearanceManager?.storiesListOptions.card.height;
  const borderRadius =
    appearanceManager?.storiesListOptions.card.variant === 'circle' ? size : 10;
  const cardOpenedStyles = story.opened
    ? appearanceManager?.storiesListOptions.card.opened
    : appearanceManager?.storiesListOptions.card;
  const storyWidth = size * story.aspectRatio;
  const storyHeight = size;
  const styles = StyleSheet.create({
    image: {
      width: storyWidth,
      height: storyHeight,
      borderRadius: borderRadius,
    },
    video: {
      width: storyWidth,
      height: storyHeight,
      borderRadius: borderRadius,
    },
    title: {
      textAlign:
        appearanceManager?.storiesListOptions.card.title.textAlign || 'center',
      paddingHorizontal: 5,
      paddingVertical: 5,
      width: '100%',
      //backgroundColor: 'rgba(255,255,255,0.1)',
    },
  });

  const cover = story.coverVideoPath ? (
    <View style={[styles.video, { borderRadius }]}>
      <Video
        source={{
          uri: (Platform.OS === 'android' ? '' : '') + story?.coverVideoPath,
        }}
        style={[styles.video, { borderRadius, overflow: 'hidden' }]}
        repeat={true}
        volume={0}
        resizeMode={'cover'}
        paused={false}
        playInBackground={true}
        playWhenInactive={true}
        useTextureView={false}
        disableFocus={true}
      />
    </View>
  ) : story.coverImagePath ? (
    <Image
      source={{
        uri:
          (Platform.OS == 'android' ? 'file://' : '') + story?.coverImagePath,
      }}
      style={[styles.image, { borderRadius }]}
    />
  ) : null;
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
      <Pressable onPress={() => onPress(story)}>{renderCell(story)}</Pressable>
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
          //height:
          //appearanceManager?.storiesListOptions.card.title.lineHeight * 4,
          position: cardInsideBottom ? 'absolute' : 'relative',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          height: cellSize,
        },
      ]}
    >
      {title}
    </Text>
  ) : null;

  return (
    <Pressable
      style={{
        flexDirection: 'column',
        paddingHorizontal: !cellSize
          ? appearanceManager?.storiesListOptions.sidePadding
          : 2,
        opacity: cardOpenedStyles.opacity || 1,
        paddingTop: !cellSize
          ? appearanceManager?.storiesListOptions.topPadding
          : 1,
        paddingBottom: !cellSize
          ? appearanceManager?.storiesListOptions.bottomPadding
          : 0,
      }}
      onPress={() => onPress(story)}
    >
      {cardOutsideTop && titleBox}
      <View
        style={{
          borderWidth: !hideBorder ? cardOpenedStyles.border.width : 0,
          borderColor: cardOpenedStyles.border.color,
          width:
            storyWidth +
            cardOpenedStyles.border.gap * 2 +
            cardOpenedStyles.border.width,
          height:
            storyHeight +
            cardOpenedStyles.border.gap * 2 +
            cardOpenedStyles.border.width,
          borderRadius: borderRadius + cardOpenedStyles.border.gap,
          justifyContent: 'flex-end',
          //alignItems: 'center',
          backgroundColor: story.backgroundColor,
        }}
      >
        {cover}
        {cardInsideBottom && titleBox}
      </View>
      {cardOutsideBottom && titleBox}
    </Pressable>
  );
};
