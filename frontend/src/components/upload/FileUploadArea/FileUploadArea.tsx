"use client";
import React from "react";
import { FileUploadAreaProps } from "../types/upload.types";

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  selectedFile,
  onFileSelect,
  isDragOver,
  onDragStateChange,
  acceptedFileTypes = "image",
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    if (acceptedFileTypes === "image" && isImage) {
      onFileSelect(file);
    } else if (acceptedFileTypes === "pdf" && isPDF) {
      onFileSelect(file);
    } else if (acceptedFileTypes === "both" && (isImage || isPDF)) {
      onFileSelect(file);
    } else {
      const allowedTypes =
        acceptedFileTypes === "image"
          ? "image files"
          : acceptedFileTypes === "pdf"
          ? "PDF files"
          : "image or PDF files";
      alert(`Please select ${allowedTypes}`);
    }
  };

  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";

    // Set accept attribute based on file types
    if (acceptedFileTypes === "image") {
      input.accept = "image/*";
    } else if (acceptedFileTypes === "pdf") {
      input.accept = ".pdf,application/pdf";
    } else {
      input.accept = "image/*,.pdf,application/pdf";
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        border: `2px dashed ${isDragOver ? "#007bff" : "#ccc"}`,
        borderRadius: "8px",
        padding: "60px 40px",
        textAlign: "center",
        backgroundColor: isDragOver ? "#f0f8ff" : "#f9f9f9",
        cursor: "pointer",
        transition: "all 0.3s ease",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {selectedFile ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {selectedFile.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Selected file preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ) : (
            <div
              style={{
                width: "200px",
                height: "200px",
                backgroundColor: "#f5f5f5",
                border: "2px solid #ddd",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "48px", color: "#666" }}>📄</div>
              <div
                style={{ fontSize: "14px", color: "#666", textAlign: "center" }}
              >
                PDF Document
              </div>
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "#333",
                margin: "0 0 8px 0",
                fontWeight: "600",
              }}
            >
              {selectedFile.name}
            </p>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p
              style={{
                color: "#007bff",
                margin: "8px 0 0 0",
                fontSize: "14px",
              }}
            >
              Click to change file
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: "48px",
              color: "#999",
              marginBottom: "16px",
            }}
          >
            📁
          </div>
          <p
            style={{
              color: "#666",
              margin: "0 0 8px 0",
              fontSize: "16px",
            }}
          >
            Click to upload or drag and drop
          </p>
          <p style={{ color: "#999", margin: 0, fontSize: "14px" }}>
            {acceptedFileTypes === "image" && "Supports: JPG, PNG, GIF, WebP"}
            {acceptedFileTypes === "pdf" && "Supports: PDF files"}
            {acceptedFileTypes === "both" &&
              "Supports: JPG, PNG, GIF, WebP, PDF"}
          </p>
        </>
      )}
    </div>
  );
};

export default FileUploadArea;
