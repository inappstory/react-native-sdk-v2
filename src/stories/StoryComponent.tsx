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
}) => {
  const size = cellSize || appearanceManager?.storiesListOptions.card.height;
  const borderRadius =
    appearanceManager?.storiesListOptions.card.variant === 'circle' ? size : 10;
  const cardOpenedStyles = story.opened
    ? appearanceManager?.storiesListOptions.card.opened
    : appearanceManager?.storiesListOptions.card;
  const styles = StyleSheet.create({
    image: {
      width: size,
      height: size,
      borderRadius: borderRadius,
    },
    video: {
      width: size,
      height: size,
      borderRadius: borderRadius,
    },
    title: {
      maxWidth:
        size + cardOpenedStyles.border.gap * 2 + cardOpenedStyles.border.width,
      textAlign:
        appearanceManager?.storiesListOptions.card.title.textAlign || 'center',
    },
  });

  const cover = story.coverVideoPath ? (
    <View style={[styles.video, { borderRadius }]}>
      <Video
        source={{
          uri: (Platform.OS === 'android' ? '' : '') + story?.coverVideoPath,
        }}
        style={[
          styles.video,
          { borderRadius, overflow: 'hidden', resizeMode: 'cover' },
        ]}
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
          : 2,
        paddingBottom: !cellSize
          ? appearanceManager?.storiesListOptions.bottomPadding
          : 2,
      }}
      onPress={() => onPress(story)}
    >
      <View
        style={{
          borderWidth: cardOpenedStyles.border.width,
          borderColor: cardOpenedStyles.border.color,
          width:
            size +
            cardOpenedStyles.border.gap * 2 +
            cardOpenedStyles.border.width,
          height:
            size +
            cardOpenedStyles.border.gap * 2 +
            cardOpenedStyles.border.width,
          borderRadius: borderRadius + cardOpenedStyles.border.gap,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {cover}
      </View>
      {!hideTitle && (
        <Text
          style={[
            styles.title,
            { color: appearanceManager?.storiesListOptions.card.title.color },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};
