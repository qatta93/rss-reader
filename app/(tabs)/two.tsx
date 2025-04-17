import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feed } from "@/constants/types";

export default function ManageFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    const stored = await AsyncStorage.getItem("feeds");
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.sort(
        (a: Feed, b: Feed) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setFeeds(parsed);
    }
  };

  const saveFeedsToStorage = async (updatedFeeds: Feed[]) => {
    await AsyncStorage.setItem("feeds", JSON.stringify(updatedFeeds));
    setFeeds(updatedFeeds);
  };

  const validateUrl = (url: string) => {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(url);
  };

  const handleAddOrUpdate = async () => {
    const newErrors: typeof errors = {};
    if (!name) newErrors.name = "Pole obowiązkowe";
    if (!url) newErrors.url = "Pole obowiązkowe";
    else if (!validateUrl(url)) newErrors.url = "Niepoprawny adres URL";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const newFeed: Feed = {
      id: editingFeedId || crypto.randomUUID(),
      name,
      url,
      createdAt: new Date().toISOString(),
    };

    let updatedFeeds;
    if (editingFeedId) {
      updatedFeeds = feeds.map((f) => (f.id === editingFeedId ? newFeed : f));
      setEditingFeedId(null);
    } else {
      updatedFeeds = [...feeds, newFeed];
      setFeedbackMessage("Feed został pomyślnie dodany!");
    }

    await saveFeedsToStorage(updatedFeeds);
    setName("");
    setUrl("");
    setErrors({});
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dodaj Nowy Feed</Text>

      <TextInput
        style={styles.input}
        placeholder="Nazwa feedu"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          if (feedbackMessage) setFeedbackMessage(null);
        }}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        style={styles.input}
        placeholder="URL RSS feedu"
        value={url}
        onChangeText={(text) => {
          setUrl(text);
          if (errors.url) setErrors((e) => ({ ...e, url: undefined }));
          if (feedbackMessage) setFeedbackMessage(null);
        }}
      />
      {errors.url && <Text style={styles.errorText}>{errors.url}</Text>}

      <Button
        title={editingFeedId ? "Zapisz zmiany" : "Dodaj feed"}
        onPress={handleAddOrUpdate}
      />

      {feedbackMessage && (
        <Text style={styles.successText}>{feedbackMessage}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    maxWidth: 500,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
    marginLeft: 4,
  },
  successText: {
    color: "green",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});
