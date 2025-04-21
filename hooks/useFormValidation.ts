import { useState } from "react";

export const VALIDATION = {
  REQUIRED: "Pole obowiązkowe",
  INVALID_URL: "Niepoprawny adres URL",
  INVALID_RSS: "Nieprawidłowy lub niedostępny RSS",
};

type FormErrors = {
  name?: string;
  url?: string;
};

type FormData = {
  name: string;
  url: string;
};

export function useFormValidation() {
  const [formData, setFormData] = useState<FormData>({ name: "", url: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateUrl = (url: string) => {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(url);
  };

  const validateRssUrl = async (url: string) => {
    try {
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`
      );
      const data = await response.json();
      
      return data.status === "ok";
    } catch (error) {
      console.error("Error validating RSS URL:", error);
      return false;
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = VALIDATION.REQUIRED;
    if (!formData.url) newErrors.url = VALIDATION.REQUIRED;
    else if (!validateUrl(formData.url)) newErrors.url = VALIDATION.INVALID_URL;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", url: "" });
    setErrors({});
  };

  return {
    formData,
    errors,
    validateForm,
    validateRssUrl,
    handleInputChange,
    resetForm,
    setErrors,
  };
}
