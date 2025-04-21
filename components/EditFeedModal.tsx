import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  Pressable,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feed } from "@/constants/types";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFormValidation, VALIDATION } from "../hooks/useFormValidation";

type Props = {
  visible: boolean;
  feed: Feed | null;
  onClose: () => void;
  onSave: (updatedFeed: Feed) => void;
  onDelete: (feedId: string) => void;
};

function useModalAnimation(visible: boolean) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  return {
    animationStyle: {
      opacity: opacityAnim,
      transform: [{ scale: scaleAnim }],
    },
  };
}

export default function EditFeedModal({
  visible,
  feed,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const {
    formData,
    errors,
    validateForm,
    validateRssUrl,
    handleInputChange,
    resetForm,
    setErrors,
  } = useFormValidation();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<TextInput | null>(null);

  const { animationStyle } = useModalAnimation(visible);

  useEffect(() => {
    if (feed && visible) {
      handleInputChange("name", feed.name);
      handleInputChange("url", feed.url);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [feed, visible]);

  const handleSave = async () => {
    if (!validateForm() || !feed) return;

    setLoading(true);
    const isValidRss = await validateRssUrl(formData.url);
    setLoading(false);

    if (!isValidRss) {
      setErrors((prev) => ({ ...prev, url: VALIDATION.INVALID_RSS }));
      return;
    }

    const updatedFeed = {
      ...feed,
      name: formData.name.trim(),
      url: formData.url.trim(),
    };

    onSave(updatedFeed);
    onClose();
  };

  const handleModalPress = (e: any) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDelete = () => {
    if (!feed) return;

    if (Platform.OS === "web") {
      setConfirmVisible(true);
    } else {
      Alert.alert(
        "Potwierdzenie",
        `Czy na pewno chcesz usunąć feed "${feed.name}"?`,
        [
          { text: "Anuluj", style: "cancel" },
          {
            text: "Usuń",
            style: "destructive",
            onPress: () => {
              onDelete(feed.id);
              onClose();
            },
          },
        ]
      );
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="none" transparent>
        <Pressable style={styles.overlay} onPress={handleModalPress}>
          <Animated.View style={[styles.modalContainer, animationStyle]}>
            <TouchableWithoutFeedback>
              <View style={styles.modal}>
                <View style={styles.header}>
                  <Text style={styles.title}>Edytuj Feed</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  ref={nameInputRef}
                  style={[styles.input, errors.name ? styles.inputError : null]}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                  placeholder="Nazwa"
                  selectTextOnFocus
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}

                <TextInput
                  style={[styles.input, errors.url ? styles.inputError : null]}
                  value={formData.url}
                  onChangeText={(text) => handleInputChange("url", text)}
                  placeholder="URL"
                  selectTextOnFocus
                  autoCapitalize="none"
                />
                {errors.url ? (
                  <Text style={styles.errorText}>{errors.url}</Text>
                ) : null}

                <View style={styles.buttons}>
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.buttonActive}
                      style={{ marginRight: 10 }}
                    />
                  ) : (
                    <Button title="Zapisz" onPress={handleSave} />
                  )}
                  <Button
                    title="Usuń Feed"
                    onPress={handleDelete}
                    color={Colors.alert}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </Pressable>
      </Modal>

      {Platform.OS === "web" && confirmVisible && (
        <Modal transparent animationType="fade" visible={true}>
          <Pressable
            style={styles.overlay}
            onPress={() => setConfirmVisible(false)}>
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmTitle}>Potwierdzenie</Text>
              <Text style={styles.confirmText}>
                Czy na pewno chcesz usunąć feed "{feed?.name}"?
              </Text>
              <View style={styles.confirmButtons}>
                <Button
                  title="Anuluj"
                  onPress={() => setConfirmVisible(false)}
                />
                <Button
                  title="Usuń"
                  color={Colors.alert}
                  onPress={() => {
                    if (feed) {
                      onDelete(feed.id);
                      setConfirmVisible(false);
                      onClose();
                    }
                  }}
                />
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    maxWidth: 600,
    width: "100%",
  },
  modal: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    width: "100%",
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  inputError: {
    borderColor: Colors.alert,
  },
  errorText: {
    color: Colors.alert,
    fontSize: 13,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  confirmContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    maxWidth: 500,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
  },
});
