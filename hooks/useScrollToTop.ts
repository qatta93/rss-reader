import { useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export function useScrollToTop() {
  const scrollViewRef = useRef<Animated.ScrollView | null>(null);
  const showScrollButton = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const y = event.contentOffset.y;
    const screenHeight = event.layoutMeasurement.height;

    showScrollButton.value =
      y > screenHeight * 1.5 ? withTiming(1) : withTiming(0);
  });

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToTopStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(showScrollButton.value, { duration: 300 }),
      transform: [
        {
          translateY:
            showScrollButton.value === 1 ? withTiming(0, { duration: 300 }) : withTiming(50, { duration: 300 }),
        },
      ],
    };
  });

  return {
    scrollViewRef,
    showScrollButton,
    scrollHandler,
    scrollToTop,
    scrollToTopStyle,
  };
}
