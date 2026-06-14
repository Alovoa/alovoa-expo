import React, { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

const HORIZONTAL_THRESHOLD = 120;
const VERTICAL_THRESHOLD = 100;

const VELOCITY_THRESHOLD_X = 800;
const VELOCITY_THRESHOLD_Y = 800;

type Props = {
  children: ReactNode | SharedValue<ReactNode>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  progress?: SharedValue<number>;
  tapEnabled: boolean;
  setTapEnabled: (enabled: boolean) => void;
};

export default function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  progress,
  setTapEnabled,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const isTapEnabled = useSharedValue(true);

  const { height } = useWindowDimensions();

  const scaleFont = (factor: number, min = 42, max = 80) => {
    const size = height * factor;
    return Math.min(Math.max(size, min), max);
  };

  const CARD_FONT_SIZE = scaleFont(0.1);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {


      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX / 20;
      const dx = event.translationX;
      const dy = event.translationY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      scheduleOnRN(setTapEnabled, distance < 10);

      if (progress) {
        progress.value = Math.min(distance / 200, 1);
      }
    })
    .onEnd((event) => {

      isTapEnabled.value = true;
      scheduleOnRN(setTapEnabled, true);

      const absX = Math.abs(translateX.value);
      const absY = Math.abs(translateY.value);
      const isHorizontal = absX > absY;
      if (
        (isHorizontal && translateX.value > HORIZONTAL_THRESHOLD) ||
        event.velocityX > VELOCITY_THRESHOLD_X
      ) {
        translateX.value = withTiming(500);
        if (onSwipeRight) {
          scheduleOnRN(onSwipeRight);
        }
      } else if (
        (isHorizontal && translateX.value < -HORIZONTAL_THRESHOLD) ||
        event.velocityX < -VELOCITY_THRESHOLD_X
      ) {
        translateX.value = withTiming(-500);
        if (onSwipeLeft) {
          scheduleOnRN(onSwipeLeft);
        }
      } else if (
        (!isHorizontal && translateY.value < -VERTICAL_THRESHOLD) ||
        event.velocityY < -VELOCITY_THRESHOLD_Y
      ) {
        translateY.value = withTiming(-500);
        if (onSwipeUp) {
          scheduleOnRN(onSwipeUp);
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);

        if (progress) {
          progress.value = withSpring(0);
        }
      }
    });

  const styles = StyleSheet.create({
    card: {
      position: "absolute",
      width: "100%",
      height: "100%",

      justifyContent: "center",
      alignItems: "center",
    },

    labelContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
    },

    likeText: {
      fontSize: CARD_FONT_SIZE,
      fontWeight: "bold",
      color: "#22c55e",
    },

    nopeText: {
      fontSize: CARD_FONT_SIZE,
      fontWeight: "bold",
      color: "#ef4444",
    },

    labelBackground: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 8,
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.sqrt(
      translateX.value * translateX.value +
      translateY.value * translateY.value
    );

    const opacity = interpolate(
      distance,
      [0, 150],
      [1, 0.5]
    );

    return {
      opacity,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  const likeTextStyle = useAnimatedStyle(() => {
    const x = translateX.value;

    const opacity =
      x > 4
        ? interpolate(x, [20, 120], [0, 1], Extrapolation.CLAMP)
        : 0;

    return { opacity };
  });

  const nopeTextStyle = useAnimatedStyle(() => {
    const x = translateX.value;

    const opacity =
      x < -4
        ? interpolate(x, [-120, -20], [1, 0], Extrapolation.CLAMP)
        : 0;

    return { opacity };
  });

  const likeBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, 120],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-120, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>

        <View style={styles.labelContainer} pointerEvents="none">
          <Animated.View style={[styles.labelBackground, likeBgStyle]} />
          <Animated.Text style={[styles.likeText, likeTextStyle]}>
            LIKE
          </Animated.Text>
        </View>

        <View style={styles.labelContainer} pointerEvents="none">
          <Animated.View style={[styles.labelBackground, nopeBgStyle]} />
          <Animated.Text style={[styles.nopeText, nopeTextStyle]}>
            NOPE
          </Animated.Text>
        </View>

      </Animated.View>
    </GestureDetector>
  );
}
