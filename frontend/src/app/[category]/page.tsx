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

// Helper function to get artist name based on visibility and availability
function getDisplayArtist(metadata?: Image["metadata"]): string {
  const { artist, visibility } = metadata?.keyvalues || {};
  const isVisible = visibility === "true";
  const hasArtist = artist?.trim();

  return isVisible && hasArtist ? hasArtist : "Anonymous";
}

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  });
  const [sortBy, setSortBy] = useState<
    "recent" | "name" | "size" | "downloaded"
  >("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

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

  // Fetch images with download counts and pagination
  const fetchImages = async (page: number = 1, append: boolean = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const res = await fetch(
        `https://pinata-image-api.onrender.com/api/images?page=${page}&limit=10`
      );
      console.log(`Fetching page ${page}:`, res);
      const data: {
        success: boolean;
        images: Image[];
        pagination: { page: number; limit: number; total: number };
      } = await res.json();

      console.log(`API Response for page ${page}:`, data);

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

        console.log(
          `Filtered ${filtered.length} images for category ${category} from ${imagesWithDownloads.length} total images`
        );

        if (append) {
          setImages((prev) => {
            const newImages = [...prev, ...filtered];
            console.log(`Total images after append: ${newImages.length}`);
            return newImages;
          });
        } else {
          setImages(filtered);
          console.log(`Set initial images: ${filtered.length}`);
        }

        // Update pagination state - but check if we have more pages to load
        // Since we're filtering by category, we need to keep loading until we have no more pages
        // or until we get no matching results for several consecutive pages
        const hasMorePages =
          data.pagination.page * data.pagination.limit < data.pagination.total;
        const hasMatchingImages = filtered.length > 0;

        setPagination((prev) => ({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore:
            hasMorePages && (hasMatchingImages || data.pagination.page <= 3), // Keep trying for first few pages even if no matches
        }));

        console.log(
          `Pagination updated: page=${data.pagination.page}, hasMore=${
            hasMorePages && (hasMatchingImages || data.pagination.page <= 3)
          }`
        );
      } else {
        setError("Failed to fetch images");
      }
    } catch (e) {
      setError("Failed to fetch images");
    }

    if (!append) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchImages(1, false);
  }, [category]);

  // Function to refresh images list with download counts
  const refreshImages = async () => {
    await fetchImages(1, false);
  };

  // Load more images
  const loadMoreImages = async () => {
    if (!loadingMore && pagination.hasMore) {
      console.log(
        `Loading more images, current page: ${pagination.page}, hasMore: ${pagination.hasMore}`
      );
      await fetchImages(pagination.page + 1, true);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 && // Load when 1000px from bottom
        !loadingMore &&
        pagination.hasMore
      ) {
        loadMoreImages();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, pagination.hasMore, pagination.page]);

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
          padding: "1rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h1
          className={orbitron.className}
          style={{
            fontSize: "clamp(1.5rem, 5vw, 3rem)",
            fontWeight: "700",
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
            flex: 1,
            minWidth: "200px",
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
            flexShrink: 0,
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
            paddingLeft: "1rem",
            paddingRight: "1rem",
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
            paddingLeft: "1rem",
            paddingRight: "1rem",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "1.5rem",
              fontSize: "1.2rem",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <img src="./search-icon.svg" alt="Search" width={20} height={20} />
          </div>
          <input
            type="text"
            placeholder="Search tags"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 48px",
              background: "rgba(235, 232, 226, 1)",
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
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedImage(img);
                    setShowImageModal(true);
                  }}
                >
                  <img
                    src={img.gatewayUrl}
                    alt={img.name}
                    style={{
                      width: "100%",
                      height: "clamp(100px, 20vw, 130px)",
                      maxHeight: "130px",
                      objectFit: "cover",
                      display: "block",
                      transition: "filter 0.2s, transform 0.3s ease",
                    }}
                    loading="lazy"
                  />

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

        {/* Load More Button - Fallback for manual loading */}
        {!loading && pagination.hasMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "32px 16px",
            }}
          >
            <button
              onClick={loadMoreImages}
              disabled={loadingMore}
              style={{
                padding: "12px 24px",
                background: loadingMore ? "#666" : "#EBE8E2",
                color: loadingMore ? "#ccc" : "#222",
                border: "none",
                borderRadius: "6px",
                cursor: loadingMore ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {/* Loading indicator for infinite scroll */}
        {loadingMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "16px",
              color: "#888",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #444",
                  borderTop: "2px solid #EBE8E2",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              Loading more images...
            </div>
          </div>
        )}

        {/* Pagination info */}
        {!loading && images.length > 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              color: "#888",
              fontSize: "0.9rem",
            }}
          >
            Showing {images.length} images for {String(category).toLowerCase()}{" "}
            category
            {!pagination.hasMore && " • All pages loaded"}
          </div>
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

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            style={{
              position: "relative",
              width: "min(500px, 90vw)",
              height: "min(600px, 80vh)",
              background: "rgba(51, 54, 57, 1)",
              borderRadius: "0px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
                zIndex: 2001,
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            {/* Image Container */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                width: "80%",
                margin: "0 auto",
              }}
            >
              <img
                src={selectedImage.gatewayUrl}
                alt={selectedImage.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto", // <-- Add this line
                }}
              />

              {/* Download Button - Red Triangle */}
              <button
                onClick={() =>
                  downloadImage(selectedImage, deviceId, refreshImages)
                }
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  zIndex: 2001,
                  padding: "0",
                }}
                title="Download Image"
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "12px solid transparent",
                    borderRight: "12px solid transparent",
                    borderTop: "16px solid rgba(255, 0, 0, 1)",
                  }}
                />
              </button>
            </div>

            {/* Bottom Info Section */}
            <div
              style={{
                background: "#2a2a2a",
                padding: "20px",
                color: "#fff",
              }}
            >
              {/* Tags */}
              <div style={{ marginBottom: "16px" }}>
                {(selectedImage.tags ||
                  selectedImage.metadata?.keyvalues?.tags) && (
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {(
                      selectedImage.tags ||
                      selectedImage.metadata?.keyvalues?.tags?.split(",") ||
                      []
                    )
                      .slice(0, 2)
                      .map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            background: "#555",
                            color: "#fff",
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "0.9rem",
                            fontWeight: "400",
                          }}
                        >
                          {typeof tag === "string" ? tag.trim() : tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Origin and Artist */}
              <div
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "4px",
                  color: "#ccc",
                }}
              >
                <span style={{ color: "#fff", fontWeight: "500" }}>
                  ORIGIN:
                </span>{" "}
                {selectedImage.metadata?.keyvalues?.location || "Unknown"}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  marginBottom: "16px",
                  color: "#ccc",
                }}
              >
                <span style={{ color: "#fff", fontWeight: "500" }}>
                  ARTIST:
                </span>{" "}
                {getDisplayArtist(selectedImage.metadata)}
              </div>

              {/* Category */}
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "bold",
                  letterSpacing: "0.1em",
                  color: "#fff",
                  fontFamily: "monospace",
                }}
              >
                {selectedImage.metadata?.keyvalues?.category?.toUpperCase() ||
                  "POSTER"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS for hover effects and animations */}
      <style jsx>{`
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

        /* Tablet styles */
        @media (max-width: 1024px) {
          .image-container {
            animation-delay: 0s !important;
          }
        }

        /* Mobile styles */
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

          /* Ensure minimum 2 columns on mobile */
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Small mobile styles */
        @media (max-width: 480px) {
          input[type="text"] {
            font-size: 0.9rem !important;
            padding: 10px 10px 10px 40px !important;
          }

          /* Single column on very small screens */
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Very small screens */
        @media (max-width: 360px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Desktop: Keep 3 columns */
        @media (min-width: 769px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
