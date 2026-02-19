import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../constants/theme';

interface BeforeAfterSliderProps {
  beforeUri: string | null;
  afterUri: string | null;
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const HANDLE_WIDTH = 32;

export function BeforeAfterSlider({
  beforeUri,
  afterUri,
  height = 360,
}: BeforeAfterSliderProps) {
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 32);
  const position = useSharedValue(containerWidth / 2);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
    position.value = w / 2;
  };

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const newPos = Math.min(Math.max(event.absoluteX - 16, 0), containerWidth);
      position.value = newPos;
    });

  const clipStyle = useAnimatedStyle(() => ({
    width: position.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    left: position.value - HANDLE_WIDTH / 2,
  }));

  if (!beforeUri && !afterUri) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>No photos yet</Text>
      </View>
    );
  }

  if (!afterUri) {
    return (
      <View style={[styles.container, { height }]} onLayout={onLayout}>
        {beforeUri && (
          <Image source={{ uri: beforeUri }} style={styles.fullImage} resizeMode="cover" />
        )}
        <View style={styles.labelContainer}>
          <View style={styles.label}>
            <Text style={styles.labelText}>BEFORE</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.container, { height }]} onLayout={onLayout}>
        {/* After image (bottom layer) */}
        {afterUri && (
          <Image source={{ uri: afterUri }} style={styles.fullImage} resizeMode="cover" />
        )}

        {/* Before image (clipped top layer) */}
        <Animated.View style={[styles.clipContainer, clipStyle]}>
          {beforeUri && (
            <Image
              source={{ uri: beforeUri }}
              style={[styles.fullImage, { width: containerWidth }]}
              resizeMode="cover"
            />
          )}
        </Animated.View>

        {/* Handle */}
        <Animated.View style={[styles.handle, handleStyle]}>
          <View style={styles.handleLine} />
          <View style={styles.handleCircle}>
            <Text style={styles.handleIcon}>⟺</Text>
          </View>
          <View style={styles.handleLine} />
        </Animated.View>

        {/* Labels */}
        <View style={styles.labelsRow}>
          <View style={styles.label}>
            <Text style={styles.labelText}>BEFORE</Text>
          </View>
          <View style={styles.label}>
            <Text style={styles.labelText}>AFTER</Text>
          </View>
        </View>

        {/* Hint */}
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Drag to compare</Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  fullImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  clipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: HANDLE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  handleLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  handleCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  handleIcon: {
    fontSize: 16,
    color: Colors.background,
    fontWeight: 'bold',
  },
  labelsRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelContainer: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  label: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  labelText: {
    color: 'white',
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 1,
  },
  hintContainer: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  hintText: {
    color: 'white',
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
  },
  placeholder: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
  },
});
