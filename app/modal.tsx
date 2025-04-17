import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Witaj w RSS Hub</Text>
      <Text style={styles.subtitle}>
        Twoje centrum wiadomości bez chaosu, reklam i scrollowania bez końca.
      </Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Text style={styles.description}>
        Dodawaj źródła RSS i przeglądaj artykuły z wielu miejsc w jednym,
        eleganckim miejscu. To szybki i prosty sposób na bycie na bieżąco — po
        Twojemu.
      </Text>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#888",
    marginBottom: 24,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 400,
  },
});
