import { useWindowDimensions } from "react-native";

export function useIsMobile(threshold: number = 768): boolean {
  const { width } = useWindowDimensions();
  return width < threshold;
}
