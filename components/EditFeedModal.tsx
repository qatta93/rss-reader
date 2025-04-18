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
} from "react-native";
import { Feed } from "@/constants/types";

type Props = {
  visible: boolean;
  feed: Feed | null;
  onClose: () => void;
  onSave: (updatedFeed: Feed) => void;
};

export default function EditFeedModal({
  visible,
  feed,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const nameInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (feed && visible) {
      setName(feed.name);
      setUrl(feed.url);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [feed, visible]);

  const handleSave = () => {
    if (!name || !url || !feed) return;

    const updatedFeed = {
      ...feed,
      name,
      url,
    };

    onSave(updatedFeed);
    onClose();
  };

  const handleModalPress = (e: any) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={handleModalPress}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Text style={styles.title}>Edytuj Feed</Text>

              <TextInput
                ref={nameInputRef}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nazwa"
                selectTextOnFocus
              />

              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="URL"
                selectTextOnFocus
              />

              <View style={styles.buttons}>
                <Button title="Anuluj" onPress={onClose} />
                <Button title="Zapisz" onPress={handleSave} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Pressable>
    </Modal>
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
