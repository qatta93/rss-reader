import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useAddFeedForm } from "@/hooks/useAddFeedForm";

export default function ManageFeeds() {
  const {
    formData,
    errors,
    feedbackMessage,
    loading,
    handleChange,
    handleSubmit,
  } = useAddFeedForm();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Co dziś przeczytasz?</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Nazwa feedu"
          value={formData.name}
          onChangeText={(text) => handleChange("name", text)}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="URL RSS feedu"
          value={formData.url}
          onChangeText={(text) => handleChange("url", text)}
        />
        {errors.url && <Text style={styles.errorText}>{errors.url}</Text>}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.activityIndicator} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Dodaj feed</Text>
        </TouchableOpacity>
      )}

      {feedbackMessage && (
        <Text style={styles.feedbackOverlay}>{feedbackMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 16,
    textAlign: "center",
    color: Colors.text,
  },
  inputGroup: {
    width: "100%",
    maxWidth: 500,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    width: "100%",
    color: Colors.inputText,
  },
  errorText: {
    color: Colors.alert,
    marginTop: 4,
    fontSize: 14,
  },
  activityIndicator: {
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.buttonActive,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
  },
  feedbackOverlay: {
    color: Colors.successText,
    textAlign: "center",
    marginTop: 16,
  },
});
