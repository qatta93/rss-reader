import { useState } from "react";
import { useFeedsManager } from "@/hooks/useFeedsManager";
import { useFormValidation, VALIDATION } from "@/hooks/useFormValidation";

export const useAddFeedForm = () => {
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

  const handleChange = (field: "name" | "url", value: string) => {
    handleInputChange(field, value);
    if (feedbackMessage) setFeedbackMessage(null);
  };

  const handleSubmit = async () => {
    setFeedbackMessage(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const isValidRss = await validateRssUrl(formData.url);
      
      if (!isValidRss) {
        setErrors((prev) => ({ ...prev, url: VALIDATION.INVALID_RSS }));
        setLoading(false);
        return;
      }

      const success = await addFeed(formData.name, formData.url);

      if (success) {
        resetForm();
        setFeedbackMessage("Feed został pomyślnie dodany!");
      } else {
        setFeedbackMessage("Wystąpił problem podczas dodawania feedu. Spróbuj ponownie.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setFeedbackMessage("Wystąpił błąd. Sprawdź połączenie internetowe i spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    feedbackMessage,
    loading,
    handleChange,
    handleSubmit,
  };
};
