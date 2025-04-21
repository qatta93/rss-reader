import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
import { Colors } from "@/constants/Colors";

interface FeedHeaderProps {
  title: string;
  onEdit: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({ title, onEdit }) => {
  return (
    <View style={styles.feedTitleRow}>
      <Text style={styles.feedTitle}>{title}</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <IconButton icon="pencil" size={20} />
        <Text style={styles.editText}>Edytuj feed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  feedTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 4,
    color: Colors.text,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  editText: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
});
