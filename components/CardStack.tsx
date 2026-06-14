import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
} from "react-native-reanimated";
import SwipeCard from "./SwipeCard";

type CardStackProps<T> = {
  data: T[];
  renderCard: (item: T) => React.ReactNode;
  onSwipeLeft?: (item: T) => void;
  onSwipeRight?: (item: T) => void;
  onSwipeUp?: (item: T) => void;
  tapEnabled: boolean;
  setTapEnabled: (enabled: boolean) => void;
};

export default function CardStack<T>({
  data,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  tapEnabled,
  setTapEnabled,
}: CardStackProps<T>) {
  const [stack, setStack] = useState<T[]>(data);
  const progress = useSharedValue(0);

  useEffect(() => {
    setStack(data);
  }, [data]);

  const current = stack[0];

const handleSwipe = (direction: "left" | "right" | "up") => {
  const item = stack[0];
  if (!item) return;

  if (direction === "left") onSwipeLeft?.(item);
  if (direction === "right") onSwipeRight?.(item);
  if (direction === "up") onSwipeUp?.(item);

  progress.value = withTiming(0, { duration: 150 });

  setStack((prev) => prev.slice(1));
};

  const getKey = (item: any, fallback: number) =>
    item?.id ?? item?.uuid ?? fallback;

  return (
    <View style={styles.container}>
      {current && (
        <SwipeCard
          key={getKey(current, stack.length)}
          progress={progress}
          onSwipeLeft={() => handleSwipe("left")}
          onSwipeRight={() => handleSwipe("right")}
          onSwipeUp={() => handleSwipe("up")}
          tapEnabled={tapEnabled}
          setTapEnabled={setTapEnabled}
        >
          {renderCard(current)}
        </SwipeCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});