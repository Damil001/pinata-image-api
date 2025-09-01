"use client";
import { useState } from "react";
import {
  UseUploadAPIReturn,
  UploadFormData,
  API_ENDPOINTS,
} from "../types/upload.types";

export const useUploadAPI = (): UseUploadAPIReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    formData: UploadFormData,
    endpoint: string
  ): Promise<void> => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", file); // Both endpoints expect "image" field name
      formDataToSend.append("name", formData.imageName || file.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("tags", formData.tags.join(","));
      formDataToSend.append("category", formData.selectedCategory);
      formDataToSend.append("location", formData.cityCountry);
      formDataToSend.append("artist", formData.artistName);
      formDataToSend.append(
        "visibility",
        formData.visibility === "hidden" ? "false" : "true"
      );

      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (error instanceof Error) {
        setUploadError(`Upload failed: ${error.message}`);
      } else {
        setUploadError("Upload failed: Unknown error");
      }
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (
    file: File,
    formData: UploadFormData
  ): Promise<void> => {
    return uploadFile(file, formData, API_ENDPOINTS.UPLOAD);
  };

  const uploadPDF = async (
    file: File,
    formData: UploadFormData
  ): Promise<void> => {
    return uploadFile(file, formData, API_ENDPOINTS.UPLOAD_PDF);
  };

  const resetError = () => {
    setUploadError(null);
  };

  return {
    uploading,
    uploadError,
    uploadImage,
    uploadPDF,
    resetError,
  };
};
