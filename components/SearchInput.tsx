import React from "react";
import { TextInput, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
}) => {
  return (
    <TextInput
      style={styles.searchInput}
      placeholder="Wyszukaj po tytule..."
      value={value}
      onChangeText={onChangeText}
    />
  );
};

const styles = StyleSheet.create({
  searchInput: {
    height: 40,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 10,
    fontSize: 16,
    width: 300,
    alignSelf: "center",
    color: Colors.text,
  },
});
