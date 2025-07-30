"use client";
import { useState } from "react";
import { UseFormStateReturn, UploadFormData, DEFAULT_FORM_DATA } from "../types/upload.types";

export const useFormState = (): UseFormStateReturn => {
  const [formData, setFormData] = useState<UploadFormData>(DEFAULT_FORM_DATA);

  const updateFormData = (data: Partial<UploadFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
  };

  const isFormValid = formData.agreedToTerms && formData.selectedCategory !== '';

  return {
    formData,
    updateFormData,
    resetForm,
    isFormValid,
  };
};