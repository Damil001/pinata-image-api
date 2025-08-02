"use client";
import { useParams } from "next/navigation";
import { Orbitron } from "next/font/google";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UploadModal, useModalAnimation, Image } from "@/components/upload";
import CustomDropdown, {
  type DropdownOption,
} from "@/components/CustomDropdown";
import LoadingSkeleton from "@/components/LoadingSkeleton";

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

export default function CategoryPage() {
  const params = useParams();
  const { category } = params;

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "recent" | "name" | "size" | "downloaded"
  >("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");

  // Enhanced dropdown options for sorting
  const sortOptions: DropdownOption[] = [
    { value: "recent", label: "Most Recent", icon: "⌛" },
    { value: "downloaded", label: "Most Downloaded", icon: "🔻" },
    { value: "name", label: "Name (A-Z)", icon: "🔤" },
    { value: "size", label: "File Size", icon: "💾" },
  ];

  // File type filter options
  const fileTypeOptions: DropdownOption[] = [
    { value: "all", label: "All Types", icon: "📁" },
    { value: "jpg", label: "JPEG", icon: "🖼️" },
    { value: "png", label: "PNG", icon: "🖼️" },
    { value: "gif", label: "GIF", icon: "🎞️" },
    { value: "webp", label: "WebP", icon: "🖼️" },
  ];

  // Get all unique tags from images
  const allTags = Array.from(
    new Set(
      images.flatMap(
        (img) =>
          img.tags ||
          img.metadata?.keyvalues?.tags?.split(",").map((tag) => tag.trim()) ||
          []
      )
    )
  ).filter(Boolean);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  const modalAnimation = useModalAnimation();

  // Get or generate deviceId from localStorage
  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  // Fetch images with download counts
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
                console.log(`Download data for ${img.ipfsHash}:`, downloadData); // Debug log
                if (downloadData.success) {
                  // Handle different possible API response structures
                  const totalDownloads =
                    downloadData.downloads?.total || downloadData.total || 0;
                  const uniqueDownloads =
                    downloadData.downloads?.unique || downloadData.unique || 0;
                  return {
                    ...img,
                    totalDownloads,
                    uniqueDownloads,
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

  // Function to refresh images list with download counts
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
              console.log(
                `Refresh - Download data for ${img.ipfsHash}:`,
                downloadData
              ); // Debug log
              if (downloadData.success) {
                // Handle different possible API response structures
                const totalDownloads =
                  downloadData.downloads?.total || downloadData.total || 0;
                const uniqueDownloads =
                  downloadData.downloads?.unique || downloadData.unique || 0;
                return {
                  ...img,
                  totalDownloads,
                  uniqueDownloads,
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

  // Filter and sort images based on all criteria
  const filteredAndSortedImages = React.useMemo(() => {
    let filtered = [...images];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (img) =>
          img.name.toLowerCase().includes(query) ||
          img.description?.toLowerCase().includes(query) ||
          (img.tags &&
            img.tags.some((tag) => tag.toLowerCase().includes(query))) ||
          (img.metadata?.keyvalues?.tags &&
            img.metadata.keyvalues.tags.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((img) => {
        const imageTags =
          img.tags ||
          img.metadata?.keyvalues?.tags?.split(",").map((tag) => tag.trim()) ||
          [];
        return selectedTags.some((selectedTag) =>
          imageTags.some((imageTag) =>
            imageTag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        );
      });
    }

    // Apply file type filter
    if (fileTypeFilter !== "all") {
      filtered = filtered.filter((img) => {
        const extension = img.name.split(".").pop()?.toLowerCase();
        return extension === fileTypeFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        case "downloaded":
          return (b.totalDownloads || 0) - (a.totalDownloads || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, searchQuery, selectedTags, fileTypeFilter, sortBy]);

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setFileTypeFilter("all");
    setSortBy("recent");
  };

  const handleCloseModal = () => {
    modalAnimation.closeModal();
    setTimeout(() => {
      setShowUploadModal(false);
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "rgba(31, 33, 35, 1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          padding: "1.5rem",
        }}
      >
        <h1
          className={orbitron.className}
          style={{
            fontSize: "3rem",
            fontWeight: "700",
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          {String(category).toUpperCase()}
        </h1>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          style={{
            background: "transparent",
            border: "none",
            color: "#FFFFFF",
            fontSize: "2rem",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          aria-label="Go back"
        >
          <img src="./button-back.svg" alt="Back" width={24} height={24} />
        </button>
      </div>

      {/* Controls Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            width: "100%",
          }}
        >
          <CustomDropdown
            id="sort-dropdown"
            options={sortOptions}
            value={sortBy}
            onChange={(value) =>
              setSortBy(value as "recent" | "name" | "size" | "downloaded")
            }
            aria-label="Sort images by"
            placeholder="Most Recent"
          />
        </div>

        {/* Search Bar */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "2rem",
              color: "#888",
              fontSize: "1.2rem",
              pointerEvents: "none",
              zIndex: 1,
              width: "100%",
            }}
          >
            🔍
          </div>
          <input
            type="text"
            placeholder="Search tags"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 8px 8px 48px",
              background: "#E5E5E5",
              color: "#333",
              border: "none",
              borderRadius: "24px",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.background = "#F0F0F0";
            }}
            onBlur={(e) => {
              e.target.style.background = "#E5E5E5";
            }}
          />
        </div>
      </div>

      {/* Hidden Filter Controls - Keep functionality but hide UI */}
      <div style={{ display: "none" }}>
        <CustomDropdown
          id="filetype-dropdown"
          options={fileTypeOptions}
          value={fileTypeFilter}
          onChange={(value) => setFileTypeFilter(value)}
          aria-label="Filter by file type"
          placeholder="All types"
        />

        {/* Tags Filter - Hidden but functional */}
        {allTags.length > 0 && (
          <div>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                style={{ display: "none" }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 0,
        }}
      >
        {error && (
          <div
            style={{
              background: "rgba(220, 53, 69, 0.1)",
              border: "1px solid rgba(220, 53, 69, 0.3)",
              borderRadius: "8px",
              padding: "16px",
              margin: "16px 0",
              color: "#ff6b6b",
              textAlign: "center",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton count={9} />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0,
              }}
            >
              {filteredAndSortedImages.map((img: Image, index) => (
                <div
                  key={img.id}
                  className="image-container"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: "#222",
                    opacity: 0,
                    animation: "fadeInUp 0.5s ease-out forwards",
                    animationDelay: `${Math.min(index * 0.1, 1)}s`,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
                      transition: "filter 0.2s, transform 0.3s ease",
                    }}
                    loading="lazy"
                  />
                  <button
                    onClick={() => downloadImage(img, deviceId, refreshImages)}
                    className="download-btn"
                    style={{
                      position: "absolute",
                      bottom: 16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0,0,0,0.8)",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      opacity: 0,
                      transition: "opacity 0.2s, transform 0.2s",
                      cursor: "pointer",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "1rem",
                      pointerEvents: "none",
                    }}
                  >
                    Download
                  </button>

                  {/* Image Info Overlay */}
                  <div
                    className="image-info"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
                      padding: "8px",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        color: "#fff",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {img.name}
                    </div>
                    {img.size && (
                      <div
                        style={{
                          color: "#ccc",
                          fontSize: "0.7rem",
                          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        }}
                      >
                        {(img.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    )}
                    {(img.totalDownloads || 0) > 0 && (
                      <div
                        style={{
                          color: "#4CAF50",
                          fontSize: "0.7rem",
                          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                          fontWeight: "bold",
                        }}
                      >
                        ↓ {img.totalDownloads} downloads
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {filteredAndSortedImages.length === 0 && images.length > 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 16px",
                  color: "#888",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <h3 style={{ color: "#EBE8E2", marginBottom: "8px" }}>
                  No matches found
                </h3>
                <p>Try adjusting your search or filter criteria.</p>
                <button
                  onClick={clearFilters}
                  style={{
                    marginTop: "16px",
                    padding: "8px 16px",
                    background: "rgba(235, 232, 226, 0.1)",
                    color: "#EBE8E2",
                    border: "1px solid #444",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(235, 232, 226, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(235, 232, 226, 0.1)";
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
            {images.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 16px",
                  color: "#888",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📷</div>
                <h3 style={{ color: "#EBE8E2", marginBottom: "8px" }}>
                  No images found
                </h3>
                <p>No images found for this category yet.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setShowUploadModal(true);
          modalAnimation.openModal();
        }}
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

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={handleCloseModal}
        onUploadSuccess={refreshImages}
        setToast={(message) => {
          if (message?.type === "success") {
            toast.success(message.message);
          } else if (message?.type === "error") {
            toast.error(message.message);
          }
        }}
        isVisible={modalAnimation.isVisible}
        isAnimating={modalAnimation.isAnimating}
      />

      {/* Enhanced CSS for hover effects and animations */}
      <style jsx>{`
        .image-container:hover .download-btn {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: translateX(-50%) translateY(-2px) !important;
        }

        .image-container:hover .image-info {
          opacity: 1 !important;
        }

        .image-container:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }

        .image-container:hover img {
          transform: scale(1.02) !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .image-container {
            animation-delay: 0s !important;
          }

          .image-container:hover {
            transform: none !important;
            box-shadow: none !important;
          }

          .image-container:hover img {
            transform: none !important;
          }
        }

        @media (max-width: 480px) {
          input[type="text"] {
            width: 200px !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
}
