import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
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
  const [name, setName] = useState(feed?.name || "");
  const [url, setUrl] = useState(feed?.url || "");
  const inputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (feed) {
      setName(feed.name);
      setUrl(feed.url);
    }
  }, [feed]);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleSave = () => {
    if (!name || !url) return;

    const updatedFeed = {
      ...feed!,
      name,
      url,
    };

    onSave(updatedFeed);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modal}>
              <Text style={styles.title}>Edytuj Feed</Text>

              <TextInput
                ref={inputRef}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nazwa"
              />
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="URL"
              />

              <View style={styles.buttons}>
                <Button title="Anuluj" onPress={onClose} />
                <Button title="Zapisz" onPress={handleSave} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxWidth: 600,
    alignSelf: "center",
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
