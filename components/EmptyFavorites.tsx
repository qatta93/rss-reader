import React from "react";
import { Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

export const EmptyFavorites: React.FC = () => {
  return <Text style={styles.noFavoritesText}>Brak ulubionych artykułów.</Text>;
};

const styles = StyleSheet.create({
  noFavoritesText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: Colors.mutedText,
  },
});
