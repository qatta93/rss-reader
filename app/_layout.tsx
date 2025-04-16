import { Slot } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";

export default function Layout() {
  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
