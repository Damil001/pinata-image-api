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
    };
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
}

// Component Props Interfaces
export interface FileUploadAreaProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  isDragOver: boolean;
  onDragStateChange: (isDragOver: boolean) => void;
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
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
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
  { value: "allmedia", label: "All Media" },
  { value: "default", label: "Default" },
  { value: "tbd", label: "TBD" },
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
  tags: ["Barcelona", "Palestine"],
  agreedToTerms: false,
};

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: "https://pinata-image-api.onrender.com/api/upload",
  IMAGES: "https://pinata-image-api.onrender.com/api/images",
  DOWNLOAD: "https://pinata-image-api.onrender.com/api/download",
} as const;
