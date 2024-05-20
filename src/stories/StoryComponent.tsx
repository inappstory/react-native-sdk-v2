import * as React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Video from 'react-native-video';

export const StoryComponent = ({ story, appearanceManager, onPress }) => {
  const borderRadius =
    appearanceManager?.storiesListOptions.card.variant === 'circle'
      ? appearanceManager?.storiesListOptions.card.height
      : 10;
  const cardOpenedStyles = story.is_opened
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

  const cover = story.video_cover ? (
    <View style={[styles.video, { borderRadius }]}>
      <Video
        source={{ uri: story?.video_cover[0].url }}
        style={[
          styles.video,
          { borderRadius, overflow: 'hidden', resizeMode: 'cover' },
        ]}
        repeat={true}
        volume={0}
        resizeMode={'cover'}
      />
    </View>
  ) : story.image ? (
    <Image
      source={{ uri: story?.image[0].url }}
      style={[styles.image, { borderRadius }]}
    />
  ) : null;

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
        {story.title}
      </Text>
    </Pressable>
  );
};
