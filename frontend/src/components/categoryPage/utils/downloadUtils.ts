// utils/downloadUtils.ts
import { Image } from "../types";

// Configuration constants
const API_CONFIG = {
  BASE_URL: "https://pinata-image-api.onrender.com",
  ENDPOINTS: {
    DOWNLOAD: "/api/download",
  },
  HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

// Error types for better error handling
export enum DownloadErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  FILE_ACCESS_ERROR = "FILE_ACCESS_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class DownloadError extends Error {
  constructor(
    public type: DownloadErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "DownloadError";
  }
}

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "unknown";
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to sanitize filename
const sanitizeFilename = (filename: string): string => {
  // Remove or replace invalid characters for file names
  return filename
    .replace(/[<>:"/\\|?*]/g, "_") // Replace invalid chars with underscore
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .substring(0, 255); // Limit filename length
};

// Record download in backend
const recordDownload = async (
  imageId: string,
  deviceId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DOWNLOAD}`,
      {
        method: "POST",
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          imageId,
          deviceId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new DownloadError(
        DownloadErrorType.API_ERROR,
        `Failed to record download: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // Optionally parse and validate response
    try {
      const data = await response.json();
      if (!data.success && data.success !== undefined) {
        throw new DownloadError(
          DownloadErrorType.API_ERROR,
          `Download recording failed: ${data.message || "Unknown error"}`
        );
      }
    } catch (parseError) {
      // If response is not JSON, that's okay for some APIs
      console.warn("Response is not JSON, but request succeeded");
    }
  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }

    throw new DownloadError(
      DownloadErrorType.NETWORK_ERROR,
      `Network error while recording download: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error instanceof Error ? error : undefined
    );
  }
};

// Download file from URL
const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    // Fetch the file
    const response = await fetch(url);

    if (!response.ok) {
      throw new DownloadError(
        DownloadErrorType.FILE_ACCESS_ERROR,
        `Failed to fetch file: ${response.status} ${response.statusText}`
      );
    }

    // Get the blob
    const blob = await response.blob();

    if (blob.size === 0) {
      throw new DownloadError(
        DownloadErrorType.FILE_ACCESS_ERROR,
        "Downloaded file is empty"
      );
    }

    // Create download link
    const sanitizedFilename = sanitizeFilename(filename);
    const objectURL = URL.createObjectURL(blob);

    try {
      // Create and trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = objectURL;
      downloadLink.download = sanitizedFilename;
      downloadLink.style.display = "none";

      // Add to DOM, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up object URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(objectURL);
      }, 200);
    } catch (downloadError) {
      // Clean up object URL on error
      URL.revokeObjectURL(objectURL);
      throw new DownloadError(
        DownloadErrorType.FILE_ACCESS_ERROR,
        `Failed to trigger download: ${
          downloadError instanceof Error
            ? downloadError.message
            : "Unknown error"
        }`,
        downloadError instanceof Error ? downloadError : undefined
      );
    }
  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }

    throw new DownloadError(
      DownloadErrorType.FILE_ACCESS_ERROR,
      `File download failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error instanceof Error ? error : undefined
    );
  }
};

// Show user-friendly error messages
const getUserFriendlyErrorMessage = (error: DownloadError): string => {
  switch (error.type) {
    case DownloadErrorType.NETWORK_ERROR:
      return "Network connection failed. Please check your internet connection and try again.";
    case DownloadErrorType.API_ERROR:
      return "Server error occurred while processing your download. Please try again later.";
    case DownloadErrorType.FILE_ACCESS_ERROR:
      return "Failed to download the file. The file may be corrupted or unavailable.";
    default:
      return "An unexpected error occurred while downloading. Please try again.";
  }
};

// Progress callback type
export type DownloadProgressCallback = (progress: {
  phase: "recording" | "downloading" | "complete";
  message: string;
}) => void;

// Main download function
export const downloadImage = async (
  image: Image,
  deviceId: string,
  refreshImages: () => Promise<void>,
  onProgress?: DownloadProgressCallback
): Promise<void> => {
  // Validate inputs
  if (!image) {
    throw new DownloadError(
      DownloadErrorType.UNKNOWN_ERROR,
      "Image data is required"
    );
  }

  if (!deviceId) {
    throw new DownloadError(
      DownloadErrorType.UNKNOWN_ERROR,
      "Device ID is required"
    );
  }

  if (!image.gatewayUrl) {
    throw new DownloadError(
      DownloadErrorType.UNKNOWN_ERROR,
      "Image URL is not available"
    );
  }

  try {
    // Step 1: Record download
    onProgress?.({
      phase: "recording",
      message: "Recording download...",
    });

    await recordDownload(image.ipfsHash, deviceId);

    // Step 2: Download file
    onProgress?.({
      phase: "downloading",
      message: `Downloading ${image.name}...`,
    });

    await downloadFile(image.gatewayUrl, image.name);

    // Step 3: Refresh images to update download counts
    onProgress?.({
      phase: "complete",
      message: "Download complete!",
    });

    // Refresh in background - don't block completion
    refreshImages().catch((error) => {
      console.warn("Failed to refresh images after download:", error);
    });
  } catch (error) {
    if (error instanceof DownloadError) {
      // Log technical details for debugging
      console.error("Download failed:", {
        type: error.type,
        message: error.message,
        imageId: image.ipfsHash,
        imageName: image.name,
        originalError: error.originalError,
      });

      // Show user-friendly message
      const userMessage = getUserFriendlyErrorMessage(error);
      alert(userMessage);
      throw error;
    }

    // Handle unexpected errors
    console.error("Unexpected download error:", error);
    const unexpectedError = new DownloadError(
      DownloadErrorType.UNKNOWN_ERROR,
      `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error instanceof Error ? error : undefined
    );

    alert(getUserFriendlyErrorMessage(unexpectedError));
    throw unexpectedError;
  }
};

// Bulk download function (bonus feature)
export const downloadMultipleImages = async (
  images: Image[],
  deviceId: string,
  refreshImages: () => Promise<void>,
  onProgress?: (current: number, total: number, currentImage: string) => void
): Promise<{ successful: number; failed: number; errors: DownloadError[] }> => {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as DownloadError[],
  };

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    try {
      onProgress?.(i + 1, images.length, image.name);

      await downloadImage(image, deviceId, refreshImages);
      results.successful++;

      // Small delay between downloads to avoid overwhelming the server
      if (i < images.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      results.failed++;
      if (error instanceof DownloadError) {
        results.errors.push(error);
      }
    }
  }

  return results;
};

// Utility function to check if download is supported
export const isDownloadSupported = (): boolean => {
  return typeof document !== "undefined" && "createElement" in document;
};

// Utility function to get image info for download
export const getImageDownloadInfo = (image: Image) => {
  return {
    name: image.name,
    size: image.size ? formatFileSize(image.size) : "Unknown size",
    extension: getFileExtension(image.name),
    url: image.gatewayUrl,
    downloads: image.totalDownloads || 0,
  };
};
