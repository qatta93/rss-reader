import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.loaderContainer}>
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.buttonActive,
  },
});
