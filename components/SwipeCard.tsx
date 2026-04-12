import React, { ReactNode } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate
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

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
});