import { useRef, useEffect } from "react";
import { Animated } from "react-native";

export function useModalAnimation(visible: boolean) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  return {
    animationStyle: {
      opacity: opacityAnim,
      transform: [{ scale: scaleAnim }],
    },
  };
}
