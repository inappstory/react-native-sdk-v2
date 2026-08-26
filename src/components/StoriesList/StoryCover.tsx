import { useMemo } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import Video, { MixWithOthersType, ViewType } from 'react-native-video';

type StoryCoverProps = {
  videoPath?: string;
  imagePath?: string;
  backgroundColor: string;
  width: number;
  height: number;
  borderRadius: number;
  maskColor?: string;
};

const toFileUri = (path: string) =>
  (Platform.OS === 'android' ? 'file://' : '') + path;

export const StoryCover = ({
  videoPath,
  imagePath,
  backgroundColor,
  width,
  height,
  borderRadius,
  maskColor,
}: StoryCoverProps) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        cover: { backgroundColor, width, height, borderRadius },
        video: { width, height, borderRadius, overflow: 'hidden' },
        mask: {
          position: 'absolute',
          width,
          height,
          borderRadius,
          backgroundColor: maskColor ?? 'transparent',
        },
      }),
    [backgroundColor, width, height, borderRadius, maskColor]
  );

  const mask = <View style={styles.mask} />;

  if (videoPath) {
    return (
      <View style={styles.cover}>
        <Video
          source={{ uri: toFileUri(videoPath) }}
          style={styles.video}
          repeat={true}
          volume={0}
          resizeMode="cover"
          paused={false}
          mixWithOthers={MixWithOthersType.MIX}
          playInBackground={false}
          playWhenInactive={false}
          viewType={ViewType.TEXTURE}
          disableFocus={true}
        />
        {mask}
      </View>
    );
  }

  if (imagePath) {
    return (
      <View style={styles.cover}>
        <Image
          resizeMode="cover"
          source={{ uri: toFileUri(imagePath) }}
          style={styles.cover}
        />
        {mask}
      </View>
    );
  }

  return <View style={styles.cover}>{mask}</View>;
};
