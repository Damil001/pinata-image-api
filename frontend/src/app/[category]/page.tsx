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
  downloads?: number; // Optional, for sorting by most downloaded
};

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Helper function to programmatically download an image
function downloadImage(url: string, filename: string) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 200);
    });
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
  // Check if file is an image
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
  // Small delay to ensure the modal is rendered before starting animation
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
  setAgreedToTerms: (agreed: boolean) => void
) {
  setIsModalVisible(false);
  // Wait for animation to complete before hiding modal
  setTimeout(() => {
    setShowUploadModal(false);
    setIsModalAnimating(false);
    // Reset form
    setSelectedFile(null);
    setSelectedCategory("");
    setCityCountry("");
    setArtistName("");
    setVisibility("visible");
    setTags(["Barcelona", "Palestine"]);
    setNewTag("");
    setAgreedToTerms(false);
  }, 300);
}

export default function CategoryPage() {
  const params = useParams();
  const { category } = params;

  // You can use the category param to fetch data or render content
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

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://pinata-image-api.onrender.com/api/images"
        );
        const data: { success: boolean; images: Image[] } = await res.json();
        if (data.success) {
          // Filter images by tag or name matching the category
          const filtered = data.images.filter(
            (img: Image) =>
              (img.tags && img.tags.includes(String(category))) ||
              (img.name &&
                img.name.toLowerCase().includes(String(category).toLowerCase()))
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

  // Sort images based on filter
  const sortedImages = [...images].sort((a, b) => {
    if (filter === "recent") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      // Most Downloaded (fallback to 0 if undefined)
      return (b.downloads || 0) - (a.downloads || 0);
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
      <p>Hello to the {category} page.</p>

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
                onClick={() => downloadImage(img.gatewayUrl, img.name)}
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
                  setAgreedToTerms
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
                  <option value="art">Art</option>
                  <option value="photography">Photography</option>
                  <option value="design">Design</option>
                  <option value="nature">Nature</option>
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

              {/* Upload Button */}
              <button
                disabled={!agreedToTerms || !selectedCategory || !selectedFile}
                onClick={() => {
                  // Handle upload logic here
                  console.log("Uploading file:", selectedFile);
                  console.log("Category:", selectedCategory);
                  console.log("City/Country:", cityCountry);
                  console.log("Artist:", artistName);
                  console.log("Visibility:", visibility);
                  console.log("Tags:", tags);
                  alert("Upload functionality would be implemented here");
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor:
                    agreedToTerms && selectedCategory && selectedFile
                      ? "#666"
                      : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "1rem",
                  cursor:
                    agreedToTerms && selectedCategory && selectedFile
                      ? "pointer"
                      : "not-allowed",
                  fontWeight: "600",
                }}
              >
                Upload
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
