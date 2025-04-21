import { useState } from "react";
import { Platform, Alert } from "react-native";

export function useDeleteConfirmation() {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const showDeleteConfirmation = (feedName: string, onConfirm: () => void) => {
    if (Platform.OS === "web") {
      setConfirmVisible(true);
    } else {
      Alert.alert(
        "Potwierdzenie",
        `Czy na pewno chcesz usunąć feed "${feedName}"?`,
        [
          { text: "Anuluj", style: "cancel" },
          {
            text: "Usuń",
            style: "destructive",
            onPress: onConfirm,
          },
        ]
      );
    }
  };

  const hideDeleteConfirmation = () => {
    setConfirmVisible(false);
  };

  return {
    confirmVisible,
    showDeleteConfirmation,
    hideDeleteConfirmation,
  };
}
