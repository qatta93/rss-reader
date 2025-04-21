import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: "all" | "read" | "unread") => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.filterRow}>
      {["all", "unread", "read"].map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => onFilterChange(type as "all" | "read" | "unread")}
          style={[
            styles.filterButton,
            activeFilter === type && styles.activeFilterButton,
          ]}>
          <Text
            style={[
              styles.filterButtonText,
              activeFilter === type && styles.activeFilterButtonText,
            ]}>
            {type === "all"
              ? "Wszystkie"
              : type === "unread"
              ? "Nieprzeczytane"
              : "Przeczytane"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.buttonInactive,
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: Colors.buttonActive,
  },
  filterButtonText: {
    color: Colors.buttonText,
    fontWeight: "600",
  },
  activeFilterButtonText: {
    color: Colors.buttonActiveText,
  },
});
