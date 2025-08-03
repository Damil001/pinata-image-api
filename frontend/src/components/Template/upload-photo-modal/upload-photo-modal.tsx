"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Orbitron } from "next/font/google";
import {
  UploadFormData,
  CATEGORY_OPTIONS,
  DEFAULT_FORM_DATA,
  API_ENDPOINTS,
} from "../../upload/types/upload.types";
import styles from "./upload-photo-modal.module.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Enhanced TypeScript interfaces
interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ToastMessage {
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface UploadPhotoModalProps {
  isOpen: boolean;
  isVisible: boolean;
  isAnimating: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  setToast: (toast: ToastMessage | null) => void;
  initialData?: Partial<UploadFormData>;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  enableProgressIndicator?: boolean;
  autoCloseOnSuccess?: boolean;
  className?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

interface UploadPhotoModalRef {
  focus: () => void;
  reset: () => void;
}

// Constants for validation and security
const DEFAULT_MAX_FILE_SIZE = 10; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const MAX_TAG_LENGTH = 50;
const MAX_TAGS_COUNT = 10;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_NAME_LENGTH = 100;

// File validation utility
const validateFile = (
  file: File,
  maxSize: number,
  allowedTypes: string[]
): FileValidationResult => {
  if (!file) {
    return { isValid: false, error: "No file selected" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not supported. Allowed types: ${allowedTypes.join(
        ", "
      )}`,
    };
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSize) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${maxSize}MB`,
    };
  }

  return { isValid: true };
};

// Sanitize input utility
const sanitizeInput = (input: string, maxLength: number): string => {
  return input.trim().slice(0, maxLength);
};

// Custom hook for form state management
const useFormState = (initialData?: Partial<UploadFormData>) => {
  const [formData, setFormData] = useState<UploadFormData>(() => ({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  }));

  const [errors, setErrors] = useState<
    Partial<Record<keyof UploadFormData, string>>
  >({});

  const updateFormData = useCallback((updates: Partial<UploadFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));

    // Clear related errors when field is updated
    const updatedFields = Object.keys(updates) as (keyof UploadFormData)[];
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedFields.forEach((field) => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof UploadFormData, string>> = {};

    if (!formData.selectedCategory) {
      newErrors.selectedCategory = "Category is required";
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms and conditions";
    }

    if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (formData.imageName.length > MAX_NAME_LENGTH) {
      newErrors.imageName = `Name must be less than ${MAX_NAME_LENGTH} characters`;
    }

    if (formData.tags.length > MAX_TAGS_COUNT) {
      newErrors.tags = `Maximum ${MAX_TAGS_COUNT} tags allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({ ...DEFAULT_FORM_DATA, ...initialData });
    setErrors({});
  }, [initialData]);

  return {
    formData,
    errors,
    updateFormData,
    validateForm,
    resetForm,
    isFormValid:
      Object.keys(errors).length === 0 &&
      formData.agreedToTerms &&
      formData.selectedCategory,
  };
};

// Custom hook for file upload management
const useFileUpload = (
  maxFileSize: number,
  allowedFileTypes: string[],
  onError: (error: string) => void
) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      const validation = validateFile(file, maxFileSize, allowedFileTypes);
      if (!validation.isValid) {
        onError(validation.error!);
        return;
      }

      setSelectedFile(file);

      // Create preview URL and clean up previous one
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    },
    [maxFileSize, allowedFileTypes, onError, previewUrl]
  );

  const resetFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragOver(false);
  }, [previewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const dragHandlers = useMemo(
    () => ({
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
          handleFileSelect(files[0]);
        }
      },
    }),
    [handleFileSelect]
  );

  return {
    selectedFile,
    previewUrl,
    isDragOver,
    handleFileSelect,
    resetFile,
    dragHandlers,
  };
};

// Custom hook for upload API
const useUploadAPI = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadImage = useCallback(
    async (file: File, formData: UploadFormData): Promise<void> => {
      if (!file) throw new Error("No file provided");

      setUploading(true);
      setUploadError(null);
      setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("image", file);
        formDataToSend.append(
          "name",
          sanitizeInput(formData.imageName || file.name, MAX_NAME_LENGTH)
        );
        formDataToSend.append(
          "description",
          sanitizeInput(formData.description, MAX_DESCRIPTION_LENGTH)
        );
        formDataToSend.append(
          "tags",
          formData.tags.slice(0, MAX_TAGS_COUNT).join(",")
        );
        formDataToSend.append("category", formData.selectedCategory);
        formDataToSend.append(
          "location",
          sanitizeInput(formData.cityCountry, 100)
        );
        formDataToSend.append(
          "artist",
          sanitizeInput(formData.artistName, 100)
        );
        formDataToSend.append(
          "visibility",
          formData.visibility === "hidden" ? "false" : "true"
        );

        const response = await fetch(API_ENDPOINTS.UPLOAD, {
          method: "POST",
          body: formDataToSend,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Upload failed");
        }

        setUploadProgress({
          loaded: file.size,
          total: file.size,
          percentage: 100,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Upload cancelled");
        }

        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setUploadError(`Upload failed: ${errorMessage}`);
        throw error;
      } finally {
        setUploading(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const resetError = useCallback(() => {
    setUploadError(null);
    setUploadProgress(null);
  }, []);

  return {
    uploading,
    uploadError,
    uploadProgress,
    uploadImage,
    cancelUpload,
    resetError,
  };
};

// Enhanced TypeScript interfaces for drag handlers
interface DragHandlers {
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

// Memoized components for performance
const FileUploadArea = memo(
  ({
    selectedFile,
    previewUrl,
    isDragOver,
    onFileSelect,
    dragHandlers,
    disabled,
  }: {
    selectedFile: File | null;
    previewUrl: string | null;
    isDragOver: boolean;
    onFileSelect: (file: File | null) => void;
    dragHandlers: DragHandlers;
    disabled?: boolean;
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = useCallback(() => {
      if (disabled) return;
      fileInputRef.current?.click();
    }, [disabled]);

    const handleFileInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onFileSelect(file);
      },
      [onFileSelect]
    );

    return (
      <div
        {...dragHandlers}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload file area"
        aria-describedby="upload-instructions"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
        style={{
          border: `2px dashed ${isDragOver ? "#007bff" : "#ccc"}`,
          borderRadius: "8px",
          padding: "60px 40px",
          textAlign: "center",
          backgroundColor: isDragOver ? "#f0f8ff" : "#f9f9f9",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          minHeight: "200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
          aria-hidden="true"
          disabled={disabled}
        />

        {selectedFile && previewUrl ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <img
              src={previewUrl}
              alt="Selected file preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
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
              aria-hidden="true"
            >
              📁
            </div>
            <p
              id="upload-instructions"
              style={{
                color: "#666",
                margin: "0 0 8px 0",
                fontSize: "16px",
              }}
            >
              Click to upload or drag and drop
            </p>
            <p style={{ color: "#999", margin: 0, fontSize: "14px" }}>
              Supports: JPG, PNG, GIF, WebP (Max: {DEFAULT_MAX_FILE_SIZE}MB)
            </p>
          </>
        )}
      </div>
    );
  }
);

FileUploadArea.displayName = "FileUploadArea";

// Progress indicator component
const ProgressIndicator = memo(({ progress }: { progress: UploadProgress }) => (
  <div style={{ width: "100%", marginBottom: "16px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "4px",
      }}
    >
      <span style={{ fontSize: "14px", color: "#666" }}>Uploading...</span>
      <span style={{ fontSize: "14px", color: "#666" }}>
        {progress.percentage.toFixed(0)}%
      </span>
    </div>
    <div
      style={{
        width: "100%",
        height: "8px",
        backgroundColor: "#e0e0e0",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress.percentage}%`,
          height: "100%",
          backgroundColor: "#007bff",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  </div>
));

ProgressIndicator.displayName = "ProgressIndicator";

// Main component
const UploadPhotoModal = forwardRef<UploadPhotoModalRef, UploadPhotoModalProps>(
  (
    {
      isOpen,
      isVisible,
      isAnimating,
      onClose,
      onUploadSuccess,
      setToast,
      initialData,
      maxFileSize = DEFAULT_MAX_FILE_SIZE,
      allowedFileTypes = DEFAULT_ALLOWED_TYPES,
      enableProgressIndicator = true,
      autoCloseOnSuccess = true,
      className = "",
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [newTag, setNewTag] = useState("");

    // Custom hooks
    const formState = useFormState(initialData);
    const fileUpload = useFileUpload(maxFileSize, allowedFileTypes, (error) =>
      setToast({ message: error, type: "error" })
    );
    const uploadAPI = useUploadAPI();

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          closeButtonRef.current?.focus();
        },
        reset: () => {
          formState.resetForm();
          fileUpload.resetFile();
          uploadAPI.resetError();
          setNewTag("");
        },
      }),
      [formState, fileUpload, uploadAPI]
    );

    // Handle escape key and focus management
    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      const handleFocusTrap = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleFocusTrap);

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("keydown", handleFocusTrap);
      };
    }, [isOpen, onClose]);

    // Handle form submission
    const handleUpload = useCallback(async () => {
      if (!fileUpload.selectedFile || !formState.validateForm()) {
        setToast({
          message: "Please fix the form errors before uploading",
          type: "error",
        });
        return;
      }

      try {
        await uploadAPI.uploadImage(
          fileUpload.selectedFile,
          formState.formData
        );
        setToast({ message: "Image uploaded successfully!", type: "success" });

        if (autoCloseOnSuccess) {
          onClose();
        }
        onUploadSuccess();
      } catch (error) {
        // Error is already handled in the hook
      }
    }, [
      fileUpload.selectedFile,
      formState,
      uploadAPI,
      setToast,
      autoCloseOnSuccess,
      onClose,
      onUploadSuccess,
    ]);

    // Handle modal close
    const handleClose = useCallback(() => {
      if (uploadAPI.uploading) {
        uploadAPI.cancelUpload();
      }
      formState.resetForm();
      fileUpload.resetFile();
      uploadAPI.resetError();
      setNewTag("");
      onClose();
    }, [uploadAPI, formState, fileUpload, onClose]);

    // Tag management
    const handleAddTag = useCallback(
      (tag: string) => {
        const trimmedTag = sanitizeInput(tag, MAX_TAG_LENGTH);
        if (
          trimmedTag &&
          !formState.formData.tags.includes(trimmedTag) &&
          formState.formData.tags.length < MAX_TAGS_COUNT
        ) {
          formState.updateFormData({
            tags: [...formState.formData.tags, trimmedTag],
          });
        }
      },
      [formState]
    );

    const handleRemoveTag = useCallback(
      (tagToRemove: string) => {
        formState.updateFormData({
          tags: formState.formData.tags.filter((tag) => tag !== tagToRemove),
        });
      },
      [formState]
    );

    const isUploadDisabled = useMemo(
      () =>
        !formState.isFormValid ||
        !fileUpload.selectedFile ||
        uploadAPI.uploading,
      [formState.isFormValid, fileUpload.selectedFile, uploadAPI.uploading]
    );

    if (!isOpen) return null;

    return (
      <div
        ref={modalRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || "upload-modal-title"}
        aria-describedby={ariaDescribedBy}
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
        <header
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
          <h1
            id="upload-modal-title"
            className={orbitron.className}
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#333",
              margin: 0,
            }}
          >
            UPLOAD FILE
          </h1>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            aria-label="Close upload modal"
            style={{
              background: "none",
              border: "none",
              fontSize: "32px",
              cursor: "pointer",
              color: "#333",
              padding: "8px",
              lineHeight: 1,
              transition: "transform 0.2s ease, color 0.2s ease",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.color = "#666";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.color = "#333";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid #007bff";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            ×
          </button>
        </header>

        {/* Content */}
        <main
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
          {/* Progress Indicator */}
          {enableProgressIndicator && uploadAPI.uploadProgress && (
            <ProgressIndicator progress={uploadAPI.uploadProgress} />
          )}

          {/* File Upload Area */}
          <FileUploadArea
            selectedFile={fileUpload.selectedFile}
            previewUrl={fileUpload.previewUrl}
            isDragOver={fileUpload.isDragOver}
            onFileSelect={fileUpload.handleFileSelect}
            dragHandlers={fileUpload.dragHandlers}
            disabled={uploadAPI.uploading}
          />

          {/* Form Fields */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpload();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Image Name Input */}
            <div>
              <label
                htmlFor="image-name"
                style={{
                  display: "block",
                  color: "#333",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Image Name (optional):
              </label>
              <input
                id="image-name"
                type="text"
                value={formState.formData.imageName}
                onChange={(e) =>
                  formState.updateFormData({ imageName: e.target.value })
                }
                placeholder="Enter image name"
                maxLength={MAX_NAME_LENGTH}
                aria-describedby={
                  formState.errors.imageName ? "image-name-error" : undefined
                }
                aria-invalid={!!formState.errors.imageName}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${
                    formState.errors.imageName ? "#d32f2f" : "#ccc"
                  }`,
                  borderRadius: "4px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {formState.errors.imageName && (
                <div
                  id="image-name-error"
                  role="alert"
                  style={{
                    color: "#d32f2f",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {formState.errors.imageName}
                </div>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label
                htmlFor="description"
                style={{
                  display: "block",
                  color: "#333",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Description:
              </label>
              <textarea
                id="description"
                value={formState.formData.description}
                onChange={(e) =>
                  formState.updateFormData({ description: e.target.value })
                }
                placeholder="Enter image description"
                rows={3}
                maxLength={MAX_DESCRIPTION_LENGTH}
                aria-describedby={
                  formState.errors.description ? "description-error" : undefined
                }
                aria-invalid={!!formState.errors.description}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${
                    formState.errors.description ? "#d32f2f" : "#ccc"
                  }`,
                  borderRadius: "4px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "4px",
                }}
              >
                {formState.errors.description && (
                  <div
                    id="description-error"
                    role="alert"
                    style={{ color: "#d32f2f", fontSize: "12px" }}
                  >
                    {formState.errors.description}
                  </div>
                )}
                <div
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginLeft: "auto",
                  }}
                >
                  {formState.formData.description.length}/
                  {MAX_DESCRIPTION_LENGTH}
                </div>
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label
                htmlFor="category"
                style={{
                  display: "block",
                  color: "#333",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Category *:
              </label>
              <select
                id="category"
                value={formState.formData.selectedCategory}
                onChange={(e) =>
                  formState.updateFormData({ selectedCategory: e.target.value })
                }
                required
                aria-describedby={
                  formState.errors.selectedCategory
                    ? "category-error"
                    : undefined
                }
                aria-invalid={!!formState.errors.selectedCategory}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${
                    formState.errors.selectedCategory ? "#d32f2f" : "#ccc"
                  }`,
                  borderRadius: "4px",
                  fontSize: "1rem",
                  backgroundColor: "#666",
                  color: "#fff",
                }}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formState.errors.selectedCategory && (
                <div
                  id="category-error"
                  role="alert"
                  style={{
                    color: "#d32f2f",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {formState.errors.selectedCategory}
                </div>
              )}
            </div>

            {/* City, Country Input */}
            <div>
              <label
                htmlFor="city-country"
                style={{
                  display: "block",
                  color: "#333",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                City, Country (optional):
                <span
                  style={{ marginLeft: "4px" }}
                  title="Location information"
                >
                  ℹ️
                </span>
              </label>
              <input
                id="city-country"
                type="text"
                value={formState.formData.cityCountry}
                onChange={(e) =>
                  formState.updateFormData({ cityCountry: e.target.value })
                }
                placeholder="Type city or country name"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Artist Name Input */}
            <div>
              <label
                htmlFor="artist-name"
                style={{
                  display: "block",
                  color: "#333",
                  marginBottom: "4px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Artist Name/Alias (optional):
                <span style={{ marginLeft: "4px" }} title="Artist information">
                  ℹ️
                </span>
              </label>
              <input
                id="artist-name"
                type="text"
                value={formState.formData.artistName}
                onChange={(e) =>
                  formState.updateFormData({ artistName: e.target.value })
                }
                placeholder="Enter artist name or alias"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Visibility Radio Buttons */}
            <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
              <legend
                style={{
                  display: "block",
                  color: "#333",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  padding: 0,
                }}
              >
                Visibility:
              </legend>
              <div style={{ display: "flex", gap: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="visible"
                    checked={formState.formData.visibility === "visible"}
                    onChange={(e) =>
                      formState.updateFormData({
                        visibility: e.target.value as "visible" | "hidden",
                      })
                    }
                    style={{ marginRight: "8px" }}
                  />
                  Visible
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#333",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="hidden"
                    checked={formState.formData.visibility === "hidden"}
                    onChange={(e) =>
                      formState.updateFormData({
                        visibility: e.target.value as "visible" | "hidden",
                      })
                    }
                    style={{ marginRight: "8px" }}
                  />
                  Hidden
                </label>
              </div>
            </fieldset>

            {/* Tags Section */}
            <div>
              <label
                htmlFor="tags-input"
                style={{
                  display: "block",
                  color: "#333",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Tags:
              </label>
              <input
                id="tags-input"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter a tag and press Enter"
                maxLength={MAX_TAG_LENGTH}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag(newTag);
                    setNewTag("");
                  }
                }}
                aria-describedby={
                  formState.errors.tags ? "tags-error" : "tags-help"
                }
                aria-invalid={!!formState.errors.tags}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${
                    formState.errors.tags ? "#d32f2f" : "#ccc"
                  }`,
                  borderRadius: "4px",
                  fontSize: "1rem",
                  marginBottom: "8px",
                  boxSizing: "border-box",
                }}
              />
              <div
                id="tags-help"
                style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}
              >
                Press Enter to add a tag. Maximum {MAX_TAGS_COUNT} tags allowed.
              </div>
              {formState.errors.tags && (
                <div
                  id="tags-error"
                  role="alert"
                  style={{
                    color: "#d32f2f",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  {formState.errors.tags}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {formState.formData.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    style={{
                      backgroundColor: "#666",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      aria-label={`Remove ${tag} tag`}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        fontSize: "16px",
                        padding: 0,
                        lineHeight: 1,
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  color: "#333",
                  fontSize: "14px",
                  cursor: "pointer",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={formState.formData.agreedToTerms}
                  onChange={(e) =>
                    formState.updateFormData({
                      agreedToTerms: e.target.checked,
                    })
                  }
                  required
                  aria-describedby={
                    formState.errors.agreedToTerms ? "terms-error" : undefined
                  }
                  aria-invalid={!!formState.errors.agreedToTerms}
                  style={{
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#007bff",
                      textDecoration: "underline",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = "2px solid #007bff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                  >
                    Terms and Conditions
                  </a>
                </span>
              </label>
              {formState.errors.agreedToTerms && (
                <div
                  id="terms-error"
                  role="alert"
                  style={{
                    color: "#d32f2f",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {formState.errors.agreedToTerms}
                </div>
              )}
            </div>

            {/* Upload Error */}
            {uploadAPI.uploadError && (
              <div
                role="alert"
                style={{
                  color: "#d32f2f",
                  backgroundColor: "#ffebee",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  border: "1px solid #ffcdd2",
                }}
              >
                <strong>Error:</strong> {uploadAPI.uploadError}
              </div>
            )}

            {/* Upload Actions */}
            <div
              style={{ display: "flex", gap: "12px", flexDirection: "column" }}
            >
              {uploadAPI.uploading && (
                <button
                  type="button"
                  onClick={uploadAPI.cancelUpload}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#f44336",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Cancel Upload
                </button>
              )}

              <button
                type="submit"
                disabled={isUploadDisabled}
                aria-describedby="upload-button-help"
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
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isUploadDisabled) {
                    e.currentTarget.style.backgroundColor = "#555";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUploadDisabled) {
                    e.currentTarget.style.backgroundColor = "#666";
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = "2px solid #007bff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
              >
                {uploadAPI.uploading ? "Uploading..." : "Upload"}
              </button>

              <div
                id="upload-button-help"
                style={{ fontSize: "12px", color: "#666", textAlign: "center" }}
              >
                {!fileUpload.selectedFile && "Please select a file to upload"}
                {fileUpload.selectedFile &&
                  !formState.formData.selectedCategory &&
                  "Please select a category"}
                {fileUpload.selectedFile &&
                  formState.formData.selectedCategory &&
                  !formState.formData.agreedToTerms &&
                  "Please agree to the terms and conditions"}
              </div>
            </div>
          </form>
        </main>
      </div>
    );
  }
);

UploadPhotoModal.displayName = "UploadPhotoModal";

export default UploadPhotoModal;
export type { UploadPhotoModalProps, UploadPhotoModalRef };
