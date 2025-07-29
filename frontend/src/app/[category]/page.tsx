"use client";
import { useParams } from "next/navigation";
import { Orbitron } from "next/font/google";
import React, { useEffect, useState } from "react";

type Image = {
  id: string;
  ipfsHash: string;
  size: number;
  timestamp: string;
  name: string;
  description: string;
  tags: string[];
  gatewayUrl: string;
  pinataUrl: string;
  totalDownloads?: number; // Updated to store total download count
  uniqueDownloads?: number; // Optional, for unique downloads
  metadata?: {
    name?: string;
    keyvalues: {
      tags?: string;
      artist?: string;
      category?: string;
      location?: string;
      visibility?: string;
      description?: string;
    };
  };
};

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Helper function to programmatically download an image and record download in backend
async function downloadImage(
  image: Image,
  deviceId: string,
  refreshImages: () => Promise<void>
) {
  try {
    // Call backend to record download
    const response = await fetch(
      "https://pinata-image-api.onrender.com/api/download",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: image.ipfsHash, // Use ipfsHash as imageId
          deviceId: deviceId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to record download: ${response.statusText}`);
    }

    // Download the file
    const blobResponse = await fetch(image.gatewayUrl);
    const blob = await blobResponse.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 200);

    // Refresh images to update download counts
    await refreshImages();
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download image or record download.");
  }
}

// Helper function to add a new tag
function addTag(
  tagText: string,
  currentTags: string[],
  setTags: (tags: string[]) => void
) {
  if (tagText.trim() && !currentTags.includes(tagText.trim())) {
    setTags([...currentTags, tagText.trim()]);
  }
}

// Helper function to remove a tag
function removeTag(
  tagToRemove: string,
  currentTags: string[],
  setTags: (tags: string[]) => void
) {
  setTags(currentTags.filter((tag) => tag !== tagToRemove));
}

// Helper function to handle file selection
function handleFileSelect(
  file: File,
  setSelectedFile: (file: File | null) => void
) {
  if (file.type.startsWith("image/")) {
    setSelectedFile(file);
  } else {
    alert("Please select an image file");
  }
}

// Helper function to handle drag and drop
function handleDragOver(e: React.DragEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDragEnter(
  e: React.DragEvent,
  setIsDragOver: (isDragOver: boolean) => void
) {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(true);
}

function handleDragLeave(
  e: React.DragEvent,
  setIsDragOver: (isDragOver: boolean) => void
) {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(false);
}

function handleDrop(
  e: React.DragEvent,
  setSelectedFile: (file: File | null) => void,
  setIsDragOver: (isDragOver: boolean) => void
) {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(false);

  const files = e.dataTransfer.files;
  if (files && files[0]) {
    handleFileSelect(files[0], setSelectedFile);
  }
}

// Helper functions for modal animation
function openModal(
  setShowUploadModal: (show: boolean) => void,
  setIsModalVisible: (visible: boolean) => void,
  setIsModalAnimating: (animating: boolean) => void
) {
  setShowUploadModal(true);
  setIsModalAnimating(true);
  setTimeout(() => {
    setIsModalVisible(true);
  }, 10);
}

function closeModal(
  setShowUploadModal: (show: boolean) => void,
  setIsModalVisible: (visible: boolean) => void,
  setIsModalAnimating: (animating: boolean) => void,
  setSelectedFile: (file: File | null) => void,
  setSelectedCategory: (category: string) => void,
  setCityCountry: (city: string) => void,
  setArtistName: (name: string) => void,
  setVisibility: (visibility: string) => void,
  setTags: (tags: string[]) => void,
  setNewTag: (tag: string) => void,
  setAgreedToTerms: (agreed: boolean) => void,
  setDescription: (description: string) => void,
  setImageName: (name: string) => void
) {
  setIsModalVisible(false);
  setTimeout(() => {
    setShowUploadModal(false);
    setIsModalAnimating(false);
    setSelectedFile(null);
    setSelectedCategory("");
    setCityCountry("");
    setArtistName("");
    setVisibility("visible");
    setTags(["Barcelona", "Palestine"]);
    setNewTag("");
    setAgreedToTerms(false);
    setDescription("");
    setImageName("");
  }, 300);
}

// Upload function to handle API call
async function uploadImage(
  selectedFile: File,
  imageName: string,
  description: string,
  tags: string[],
  selectedCategory: string,
  cityCountry: string,
  artistName: string,
  visibility: string,
  setUploading: (uploading: boolean) => void,
  setUploadError: (error: string | null) => void,
  onSuccess: () => void,
  setToast: (
    toast: { message: string; type: "success" | "error" } | null
  ) => void
) {
  if (!selectedFile) return;

  setUploading(true);
  setUploadError(null);

  try {
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("name", imageName || selectedFile.name);
    formData.append("description", description);
    formData.append("tags", tags.join(","));
    formData.append("category", selectedCategory);
    formData.append("location", cityCountry);
    formData.append("artist", artistName);
    formData.append("visibility", visibility === "hidden" ? "false" : "true");

    const response = await fetch(
      "https://pinata-image-api.onrender.com/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (result.success) {
      setToast({ message: "Image uploaded successfully!", type: "success" });
      onSuccess();
    } else {
      throw new Error(result.message || "Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      setUploadError(`Upload failed: ${error.message}`);
      setToast({ message: `Upload failed: ${error.message}`, type: "error" });
    } else {
      setUploadError("Upload failed: Unknown error");
      setToast({ message: "Upload failed: Unknown error", type: "error" });
    }
  } finally {
    setUploading(false);
  }
}

export default function CategoryPage() {
  const params = useParams();
  const { category } = params;

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"recent" | "downloaded">("recent");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [artistName, setArtistName] = useState("");
  const [visibility, setVisibility] = useState("visible");
  const [tags, setTags] = useState<string[]>(["Barcelona", "Palestine"]);
  const [newTag, setNewTag] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [description, setDescription] = useState("");
  const [imageName, setImageName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  // Get or generate deviceId from localStorage
  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  // Fetch images and their download counts
  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://pinata-image-api.onrender.com/api/images"
        );
        console.log(res);
        const data: { success: boolean; images: Image[] } = await res.json();
        if (data.success) {
          // Fetch download counts for each image
          const imagesWithDownloads = await Promise.all(
            data.images.map(async (img) => {
              try {
                const downloadRes = await fetch(
                  `https://pinata-image-api.onrender.com/api/images/${img.ipfsHash}/downloads`
                );
                const downloadData = await downloadRes.json();
                if (downloadData.success) {
                  return {
                    ...img,
                    totalDownloads: downloadData.downloads.total,
                    uniqueDownloads: downloadData.downloads.unique,
                  };
                }
                return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
              } catch (e) {
                console.error(
                  `Failed to fetch downloads for ${img.ipfsHash}:`,
                  e
                );
                return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
              }
            })
          );
          const filtered = imagesWithDownloads.filter(
            (img) =>
              img.metadata?.keyvalues?.category?.toLowerCase() ===
              String(category).toLowerCase()
          );
          setImages(filtered);
        } else {
          setError("Failed to fetch images");
        }
      } catch (e) {
        setError("Failed to fetch images");
      }
      setLoading(false);
    }
    fetchImages();
  }, [category]);

  // Function to refresh images list
  const refreshImages = async () => {
    try {
      const res = await fetch(
        "https://pinata-image-api.onrender.com/api/images"
      );
      const data: { success: boolean; images: Image[] } = await res.json();
      if (data.success) {
        const imagesWithDownloads = await Promise.all(
          data.images.map(async (img) => {
            try {
              const downloadRes = await fetch(
                `https://pinata-image-api.onrender.com/api/images/${img.ipfsHash}/downloads`
              );
              const downloadData = await downloadRes.json();
              if (downloadData.success) {
                return {
                  ...img,
                  totalDownloads: downloadData.downloads.total,
                  uniqueDownloads: downloadData.downloads.unique,
                };
              }
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            } catch (e) {
              console.error(
                `Failed to fetch downloads for ${img.ipfsHash}:`,
                e
              );
              return { ...img, totalDownloads: 0, uniqueDownloads: 0 };
            }
          })
        );
        const filtered = imagesWithDownloads.filter(
          (img) =>
            img.metadata?.keyvalues?.category?.toLowerCase() ===
            String(category).toLowerCase()
        );
        setImages(filtered);
      }
    } catch (e) {
      console.error("Failed to refresh images:", e);
    }
  };

  // Toast notification effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sort images based on filter
  const sortedImages = [...images].sort((a, b) => {
    if (filter === "recent") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return (b.totalDownloads || 0) - (a.totalDownloads || 0);
    }
  });

  return (
    <div>
      <h1
        className={orbitron.className}
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#EBE8E2",
          textAlign: "right",
          lineHeight: "1",
        }}
      >
        {category}
      </h1>

      {/* Filter Dropdown */}
      <div
        style={{
          margin: "16px 0",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <label
          style={{ color: "#EBE8E2", fontWeight: 600, marginRight: 8 }}
          htmlFor="filter-select"
        >
          Filter:
        </label>
        <select
          id="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "recent" | "downloaded")}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: "1rem",
            background: "#222",
            color: "#EBE8E2",
            outline: "none",
          }}
        >
          <option value="recent">Most Recent</option>
          <option value="downloaded">Most Downloaded</option>
        </select>
      </div>

      <div
        style={{
          marginTop: 0,
        }}
      >
        {loading && <p>Loading images...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
          }}
        >
          {sortedImages.map((img: Image) => (
            <div
              key={img.id}
              className="image-container"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "#222",
              }}
            >
              <img
                src={img.gatewayUrl}
                alt={img.name}
                style={{
                  width: "100%",
                  height: "130px",
                  maxHeight: "130px",
                  objectFit: "cover",
                  display: "block",
                  transition: "filter 0.2s",
                }}
              />
              <button
                onClick={() => downloadImage(img, deviceId, refreshImages)}
                className="download-btn"
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  pointerEvents: "none",
                }}
              >
                Download
              </button>
              {/* Display download count */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                Downloads: {img.totalDownloads || 0}
              </div>
            </div>
          ))}
        </div>
        {!loading && images.length === 0 && (
          <p>No images found for this category.</p>
        )}
      </div>
      {/* Floating Action Button */}
      <button
        onClick={() =>
          openModal(setShowUploadModal, setIsModalVisible, setIsModalAnimating)
        }
        style={{
          position: "fixed",
          left: "50%",
          bottom: 32,
          transform: "translateX(-50%)",
          background: "#EBE8E2",
          color: "#222",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          cursor: "pointer",
          zIndex: 1000,
        }}
        aria-label="Add Image"
      >
        +
      </button>

      {/* Upload Modal Overlay */}
      {showUploadModal && (
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
            opacity: isModalVisible ? 1 : 0,
            transform: isModalVisible ? "translateY(0)" : "translateY(100%)",
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
              opacity: isModalVisible ? 1 : 0,
              transform: isModalVisible ? "translateY(0)" : "translateY(-20px)",
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
              onClick={() =>
                closeModal(
                  setShowUploadModal,
                  setIsModalVisible,
                  setIsModalAnimating,
                  setSelectedFile,
                  setSelectedCategory,
                  setCityCountry,
                  setArtistName,
                  setVisibility,
                  setTags,
                  setNewTag,
                  setAgreedToTerms,
                  setDescription,
                  setImageName
                )
              }
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
              opacity: isModalVisible ? 1 : 0,
              transform: isModalVisible ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 0.5s ease-in-out 0.2s, transform 0.5s ease-in-out 0.2s",
            }}
          >
            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, setIsDragOver)}
              onDragLeave={(e) => handleDragLeave(e, setIsDragOver)}
              onDrop={(e) => handleDrop(e, setSelectedFile, setIsDragOver)}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    handleFileSelect(file, setSelectedFile);
                  }
                };
                input.click();
              }}
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
                    Supports: JPG, PNG, GIF, WebP
                  </p>
                </>
              )}
            </div>

            {/* Form Fields */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Image Name Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#333",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  Image Name (optional):
                </label>
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  placeholder="Enter image name"
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

              {/* Description Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#333",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  Description:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter image description"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    backgroundColor: "#666",
                    color: "#fff",
                  }}
                >
                  <option value="">Select a Category</option>
                  <option value="posters">Posters</option>
                  <option value="stickers">Stickers</option>
                  <option value="flyers">Flyers</option>
                  <option value="banners">Banners</option>
                  <option value="pamphlets">Pamphlets</option>
                  <option value="tactics">Tactics</option>
                  <option value="techniques">Techniques</option>
                  <option value="allmedia">All Media</option>
                  <option value="default">Default</option>
                  <option value="tbd">TBD</option>
                </select>
              </div>

              {/* City, Country Input */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#333",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  City, Country (optional): ℹ️
                </label>
                <input
                  type="text"
                  value={cityCountry}
                  onChange={(e) => setCityCountry(e.target.value)}
                  placeholder="Type and select"
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
                  style={{
                    display: "block",
                    color: "#333",
                    marginBottom: "4px",
                    fontSize: "14px",
                  }}
                >
                  Artist Name/Alias (optional): ℹ️
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
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
              <div>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#333",
                    }}
                  >
                    <input
                      type="radio"
                      value="visible"
                      checked={visibility === "visible"}
                      onChange={(e) => setVisibility(e.target.value)}
                      style={{ marginRight: "8px" }}
                    />
                    Visible
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#333",
                    }}
                  >
                    <input
                      type="radio"
                      value="hidden"
                      checked={visibility === "hidden"}
                      onChange={(e) => setVisibility(e.target.value)}
                      style={{ marginRight: "8px" }}
                    />
                    Hidden
                  </label>
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#333",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  Tags:
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Search tags"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(newTag, tags, setTags);
                      setNewTag("");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "1rem",
                    marginBottom: "8px",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {tags.map((tag, index) => (
                    <span
                      key={index}
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
                        onClick={() => removeTag(tag, tags, setTags)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "16px",
                          padding: 0,
                          lineHeight: 1,
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
                    alignItems: "center",
                    color: "#333",
                    fontSize: "14px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  I agree to the Terms and Conditions
                </label>
              </div>

              {/* Upload Error */}
              {uploadError && (
                <div
                  style={{
                    color: "#d32f2f",
                    backgroundColor: "#ffebee",
                    padding: "12px",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                >
                  {uploadError}
                </div>
              )}

              {/* Upload Button */}
              <button
                disabled={
                  !agreedToTerms ||
                  !selectedCategory ||
                  !selectedFile ||
                  uploading
                }
                onClick={async () => {
                  await uploadImage(
                    selectedFile!,
                    imageName,
                    description,
                    tags,
                    selectedCategory,
                    cityCountry,
                    artistName,
                    visibility,
                    setUploading,
                    setUploadError,
                    async () => {
                      closeModal(
                        setShowUploadModal,
                        setIsModalVisible,
                        setIsModalAnimating,
                        setSelectedFile,
                        setSelectedCategory,
                        setCityCountry,
                        setArtistName,
                        setVisibility,
                        setTags,
                        setNewTag,
                        setAgreedToTerms,
                        setDescription,
                        setImageName
                      );
                      await refreshImages();
                    },
                    setToast
                  );
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor:
                    agreedToTerms &&
                    selectedCategory &&
                    selectedFile &&
                    !uploading
                      ? "#666"
                      : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor:
                    agreedToTerms &&
                    selectedCategory &&
                    selectedFile &&
                    !uploading
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: "600",
                }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed CSS for hover effect */}
      <style jsx>{`
        .image-container:hover .download-btn {
          opacity: 1 !important;
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
}
