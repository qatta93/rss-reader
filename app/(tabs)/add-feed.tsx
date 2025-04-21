import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useFeedsManager } from "@/hooks/useFeedsManager";
import { useFormValidation, VALIDATION } from "@/hooks/useFormValidation";

export default function ManageFeeds() {
  const { addFeed } = useFeedsManager();
  const {
    formData,
    errors,
    validateForm,
    validateRssUrl,
    handleInputChange,
    resetForm,
    setErrors,
  } = useFormValidation();

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddFeed = async () => {
    setFeedbackMessage(null);

    if (!validateForm()) return;

    setLoading(true);
    const isValidRss = await validateRssUrl(formData.url);
    setLoading(false);

    if (!isValidRss) {
      setErrors((prev) => ({ ...prev, url: VALIDATION.INVALID_RSS }));
      return;
    }

    const success = await addFeed(formData.name, formData.url);

    if (success) {
      resetForm();
      setFeedbackMessage("Feed został pomyślnie dodany!");
    }
  };

  const handleInputChangeWithFeedback = (
    field: "name" | "url",
    value: string
  ) => {
    handleInputChange(field, value);
    if (feedbackMessage) setFeedbackMessage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Co dziś przeczytasz?</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="Nazwa feedu"
          value={formData.name}
          onChangeText={(text) => handleInputChangeWithFeedback("name", text)}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="URL RSS feedu"
          value={formData.url}
          onChangeText={(text) => handleInputChangeWithFeedback("url", text)}
        />
        {errors.url && <Text style={styles.errorText}>{errors.url}</Text>}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.buttonActive}
          style={styles.activityIndicator}
        />
      ) : (
        <Button title="Dodaj feed" onPress={handleAddFeed} />
      )}

      {feedbackMessage && (
        <Text style={styles.successText}>{feedbackMessage}</Text>
      )}
    </ScrollView>
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
  successText: {
    color: Colors.successText,
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  activityIndicator: {
    marginTop: 10,
  },
});
