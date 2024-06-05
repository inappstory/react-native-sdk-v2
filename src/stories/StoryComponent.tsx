import * as React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Video from 'react-native-video';

export const StoryComponent = ({
  story,
  appearanceManager,
  storyManager,
  onPress,
}) => {
  const borderRadius =
    appearanceManager?.storiesListOptions.card.variant === 'circle'
      ? appearanceManager?.storiesListOptions.card.height
      : 10;
  const cardOpenedStyles = story.opened
    ? appearanceManager?.storiesListOptions.card.opened
    : appearanceManager?.storiesListOptions.card;
  const styles = StyleSheet.create({
    image: {
      width: appearanceManager?.storiesListOptions.card.height,
      height: appearanceManager?.storiesListOptions.card.height,
      borderRadius: appearanceManager?.storiesListOptions.card.height,
    },
    video: {
      width: appearanceManager?.storiesListOptions.card.height,
      height: appearanceManager?.storiesListOptions.card.height,
      borderRadius: borderRadius,
    },
    title: {
      maxWidth:
        appearanceManager?.storiesListOptions.card.height +
        cardOpenedStyles.border.gap * 2 +
        cardOpenedStyles.border.width,
      textAlign:
        appearanceManager?.storiesListOptions.card.title.textAlign || 'center',
    },
  });

  const cover = story.coverVideoPath ? (
    <View style={[styles.video, { borderRadius }]}>
      <Video
        source={{ uri: story?.coverVideoPath }}
        style={[
          styles.video,
          { borderRadius, overflow: 'hidden', resizeMode: 'cover' },
        ]}
        repeat={true}
        volume={0}
        resizeMode={'cover'}
      />
    </View>
  ) : story.coverImagePath ? (
    <Image
      source={{ uri: story?.coverImagePath }}
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
        paddingHorizontal: appearanceManager?.storiesListOptions.sidePadding,
        opacity: cardOpenedStyles.opacity || 1,
        paddingTop: appearanceManager?.storiesListOptions.topPadding,
        paddingBottom: appearanceManager?.storiesListOptions.bottomPadding,
      }}
      onPress={() => onPress(story)}
    >
      <View
        style={{
          borderWidth: cardOpenedStyles.border.width,
          borderColor: cardOpenedStyles.border.color,
          width:
            appearanceManager?.storiesListOptions.card.height +
            cardOpenedStyles.border.gap * 2 +
            cardOpenedStyles.border.width,
          height:
            appearanceManager?.storiesListOptions.card.height +
            cardOpenedStyles.border.gap * 2 +
            cardOpenedStyles.border.width,
          borderRadius: borderRadius + cardOpenedStyles.border.gap,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {cover}
      </View>
      <Text
        style={[
          styles.title,
          { color: appearanceManager?.storiesListOptions.card.title.color },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};
