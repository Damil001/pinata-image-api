// Env used at build time by Next.js; declare so we don't require @types/node in this file
declare const process: { env: { NODE_ENV?: string; NEXT_PUBLIC_API_URL?: string } };

/** Minimal drag event shape used by handlers; matches React.DragEvent so no "react" import needed. */
export type DragEventLike = {
  preventDefault(): void;
  stopPropagation?(): void;
  dataTransfer: DataTransfer | null;
};

export interface Image {
  id: string;
  ipfsHash: string;
  size: number;
  timestamp: string;
  name: string;
  description: string;
  tags: string[];
  gatewayUrl: string;
  pinataUrl: string;
  totalDownloads?: number;
  uniqueDownloads?: number;
  metadata?: {
    name?: string;
    keyvalues: {
      tags?: string;
      artist?: string;
      category?: string;
      location?: string;
      visibility?: string;
      description?: string;
      altText?: string;
      fileType?: string;
      originalFileType?: string;
      pdfIpfsHash?: string;
      thumbnailIpfsHash?: string;
    };
  };
  // For PDFs, this will contain the thumbnail information
  thumbnail?: {
    ipfsHash: string;
    gatewayUrl: string;
    pinSize: number;
    timestamp: string;
  };
}

export interface UploadFormData {
  imageName: string;
  description: string;
  selectedCategory: string;
  cityCountry: string;
  artistName: string;
  visibility: "visible" | "hidden";
  tags: string[];
  agreedToTerms: boolean;
  fileType?: "image" | "pdf";
}

// Component Props Interfaces
export interface FileUploadAreaProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  isDragOver: boolean;
  onDragStateChange: (isDragOver: boolean) => void;
  acceptedFileTypes?: "image" | "pdf" | "both";
}

export interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  newTag: string;
  onNewTagChange: (tag: string) => void;
}

export interface UploadFormProps {
  formData: UploadFormData;
  onFormDataChange: (data: Partial<UploadFormData>) => void;
  uploadError: string | null;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  setToast: (
    toast: { message: string; type: "success" | "error" } | null
  ) => void;
  isVisible: boolean;
  isAnimating: boolean;
}

// Hook Return Types
export interface UseFileUploadReturn {
  selectedFile: File | null;
  isDragOver: boolean;
  handleFileSelect: (file: File | null) => void;
  handleDragOver: (e: DragEventLike) => void;
  handleDragEnter: (e: DragEventLike) => void;
  handleDragLeave: (e: DragEventLike) => void;
  handleDrop: (e: DragEventLike) => void;
  resetFile: () => void;
}

export interface UseFormStateReturn {
  formData: UploadFormData;
  updateFormData: (data: Partial<UploadFormData>) => void;
  resetForm: () => void;
  isFormValid: boolean;
}

export interface UseUploadAPIReturn {
  uploading: boolean;
  uploadError: string | null;
  uploadImage: (file: File, formData: UploadFormData) => Promise<void>;
  uploadPDF: (file: File, formData: UploadFormData) => Promise<void>;
  resetError: () => void;
}

export interface UseModalAnimationReturn {
  isVisible: boolean;
  isAnimating: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// Category options for the dropdown
export const CATEGORY_OPTIONS = [
  { value: "", label: "Select a Category" },
  { value: "posters", label: "Posters" },
  { value: "stickers", label: "Stickers" },
  { value: "flyers", label: "Flyers" },
  { value: "banners", label: "Banners" },
  { value: "pamphlets", label: "Pamphlets" },
  { value: "tactics", label: "Tactics" },
  { value: "techniques", label: "Techniques" },
] as const;

export type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];

// Default form data
export const DEFAULT_FORM_DATA: UploadFormData = {
  imageName: "",
  description: "",
  selectedCategory: "",
  cityCountry: "",
  artistName: "",
  visibility: "visible",
  tags: [],
  agreedToTerms: false,
};

// API endpoints – use NEXT_PUBLIC_API_URL on Render/Vercel so each deploy can point to its backend
function getApiBaseUrlValue(): string {
  if (typeof process === "undefined") return "https://pinata-image-api.onrender.com";
  if (process.env.NODE_ENV === "development") return "http://localhost:3001";
  return process.env.NEXT_PUBLIC_API_URL || "https://pinata-image-api.onrender.com";
}
const API_BASE_URL = getApiBaseUrlValue();

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/api/upload`,
  UPLOAD_PDF: `${API_BASE_URL}/api/upload-pdf`,
  IMAGES: `${API_BASE_URL}/api/images`,
  DOWNLOAD: `${API_BASE_URL}/api/download`,
} as const;

/** Use this for any API URL so the customer can set NEXT_PUBLIC_API_URL on Render/Vercel. */
export const getApiBaseUrl = (): string => API_BASE_URL;
