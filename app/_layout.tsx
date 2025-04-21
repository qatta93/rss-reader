import { Slot } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { LogBox } from "react-native";
import { useEffect, useState } from "react";
import * as Font from "expo-font";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { LoadingScreen } from "@/components/LoadingScreen";

//hide errors provided by react-native-paper
LogBox.ignoreLogs(["Support for defaultProps will be removed"]);

export default function Layout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...FontAwesome.font,
        ...MaterialCommunityIcons.font,
        'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
