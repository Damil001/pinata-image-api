"use client";
import React, { useState } from "react";
import { Orbitron } from "next/font/google";
import { UploadModalProps } from "../types/upload.types";
import { useFileUpload, useFormState, useUploadAPI } from "../hooks";
import FileUploadArea from "../FileUploadArea";
import TagsInput from "../TagsInput";
import UploadForm from "../UploadForm";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  setToast,
  isVisible,
  isAnimating,
}) => {
  const [newTag, setNewTag] = useState("");

  const fileUpload = useFileUpload();
  const formState = useFormState();
  const uploadAPI = useUploadAPI();

  const handleTagsChange = (tags: string[]) => {
    formState.updateFormData({ tags });
  };

  const handleClose = () => {
    fileUpload.resetFile();
    formState.resetForm();
    uploadAPI.resetError();
    setNewTag("");
    onClose();
  };

  const handleUpload = async () => {
    if (!fileUpload.selectedFile || !formState.isFormValid) return;

    try {
      await uploadAPI.uploadImage(fileUpload.selectedFile, formState.formData);
      setToast({ message: "Image uploaded successfully!", type: "success" });
      handleClose();
      onUploadSuccess();
    } catch (error) {
      setToast({
        message: uploadAPI.uploadError || "Upload failed: Unknown error",
        type: "error",
      });
    }
  };

  const isUploadDisabled =
    !formState.formData.agreedToTerms ||
    !formState.formData.selectedCategory ||
    !fileUpload.selectedFile ||
    uploadAPI.uploading;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#E5E5E0",
        display: "flex",
        flexDirection: "column",
        zIndex: 2000,
        overflow: "auto",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(100%)",
        transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px",
          borderBottom: "1px solid #ccc",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(-20px)",
          transition:
            "opacity 0.4s ease-in-out 0.1s, transform 0.4s ease-in-out 0.1s",
        }}
      >
        <h2
          className={orbitron.className}
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "#333",
            margin: 0,
          }}
        >
          UPLOAD FILE
        </h2>
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "32px",
            cursor: "pointer",
            color: "#333",
            padding: 0,
            lineHeight: 1,
            transition: "transform 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.color = "#666";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.color = "#333";
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "600px",
          margin: "0 auto",
          width: "100%",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 0.5s ease-in-out 0.2s, transform 0.5s ease-in-out 0.2s",
        }}
      >
        {/* File Upload Area */}
        <FileUploadArea
          selectedFile={fileUpload.selectedFile}
          onFileSelect={fileUpload.handleFileSelect}
          isDragOver={fileUpload.isDragOver}
          onDragStateChange={(isDragOver) => {
            if (isDragOver) {
              fileUpload.handleDragEnter({} as React.DragEvent);
            } else {
              fileUpload.handleDragLeave({} as React.DragEvent);
            }
          }}
        />

        {/* Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <UploadForm
            formData={formState.formData}
            onFormDataChange={formState.updateFormData}
            uploadError={uploadAPI.uploadError}
          />

          {/* Tags Section */}
          <TagsInput
            tags={formState.formData.tags}
            onTagsChange={handleTagsChange}
            newTag={newTag}
            onNewTagChange={setNewTag}
          />

          {/* Upload Button */}
          <button
            disabled={isUploadDisabled}
            onClick={handleUpload}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isUploadDisabled ? "#ccc" : "#666",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: isUploadDisabled ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {uploadAPI.uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
