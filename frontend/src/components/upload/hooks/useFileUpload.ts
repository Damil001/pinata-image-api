"use client";
import { useState } from "react";
import { UseFileUploadReturn } from "../types/upload.types";

export const useFileUpload = (): UseFileUploadReturn => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    } else if (file) {
      alert("Please select an image file");
    } else {
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const resetFile = () => {
    setSelectedFile(null);
    setIsDragOver(false);
  };

  return {
    selectedFile,
    isDragOver,
    handleFileSelect,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    resetFile,
  };
};