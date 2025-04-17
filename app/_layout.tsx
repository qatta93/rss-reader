import { Slot } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { LogBox } from "react-native";

//hide errors provided by react-native-paper
LogBox.ignoreLogs(["Support for defaultProps will be removed"]);

export default function Layout() {
  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
