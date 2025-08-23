// CategoryPage.tsx - Main Component
"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { UploadModal, useModalAnimation } from "@/components/upload";

// Import our new components
import PageHeader from "../../components/categoryPage/components/PageHeader";
import SearchAndFilter from "../../components/categoryPage/components/SearchAndFilter";
import ImageGrid from "../../components/categoryPage/components/ImageGrid";
import LoadingAndPagination from "../../components/categoryPage/components/LoadingAndPagination";
import ImageModal from "../../components/categoryPage/components/ImageModal";

// Import hooks and utils
import { useDeviceId } from "../../components/categoryPage/hooks/useDeviceId";
import { usePageAnimation } from "../../components/categoryPage/hooks/usePageAnimation";
import { useImageData } from "../../components/categoryPage/hooks/useImageData";
import { downloadImage } from "../../components/categoryPage/utils/downloadUtils";
import { Image } from "../../components/categoryPage/types";

export default function CategoryPage() {
  const params = useParams();
  const { category } = params;

  // Custom hooks
  const pageLoaded = usePageAnimation();
  const deviceId = useDeviceId();
  const {
    images,
    loading,
    loadingMore,
    error,
    pagination,
    loadMoreImages,
    refreshImages,
  } = useImageData(String(category));

  // Local state
  const [sortBy, setSortBy] = useState<
    "recent" | "name" | "size" | "downloaded"
  >("recent");
  const [searchInput, setSearchInput] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const modalAnimation = useModalAnimation();

  // Update available tags when images change
  useEffect(() => {
    const allUniqueTags = Array.from(
      new Set(
        images.flatMap(
          (img) =>
            img.tags ||
            img.metadata?.keyvalues?.tags
              ?.split(",")
              .map((tag) => tag.trim()) ||
            []
        )
      )
    ).filter(Boolean);

    setAvailableTags(allUniqueTags);
  }, [images]);

  // Tag management functions
  const addTagChip = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag.trim())) {
      setSelectedTags((prev) => [...prev, tag.trim()]);
      setSearchInput("");
    }
  };

  const removeTagChip = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchInput.trim()) {
      addTagChip(searchInput.trim());
    }
  };

  // Filter available tags based on search input
  const filteredAvailableTags = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(searchInput.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  // Filter and sort images
  const filteredAndSortedImages = useMemo(() => {
    let filtered = [...images];

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
  }, [images, selectedTags, fileTypeFilter, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setSelectedTags([]);
    setFileTypeFilter("all");
    setSortBy("recent");
  };

  // Modal handlers
  const handleCloseUploadModal = () => {
    modalAnimation.closeModal();
    setTimeout(() => {
      setShowUploadModal(false);
    }, 300);
  };

  const handleImageClick = (image: Image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleDownload = async (image: Image) => {
    await downloadImage(image, deviceId, refreshImages);
  };

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        !loadingMore &&
        pagination.hasMore
      ) {
        loadMoreImages();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, pagination.hasMore, loadMoreImages]);
  console.log(images);
  return (
    <>
      {!showImageModal && !showUploadModal && (
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
            opacity: pageLoaded ? 1 : 0,
            transition: "opacity 0.5s ease 1s",
          }}
          aria-label="Add Image"
        >
          +
        </button>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
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
      <div
        className={`page-container ${pageLoaded ? "page-loaded" : ""}`}
        style={{
          minHeight: "100vh",
          background: "rgba(31, 33, 35, 1)",
          fontFamily: "Arial, sans-serif",
          transform: pageLoaded ? "translateY(0)" : "translateY(100vh)",
          transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          opacity: pageLoaded ? 1 : 0,
        }}
      >
        {/* Header */}
        <PageHeader
          category={String(category)}
          onBack={() => window.history.back()}
        />

        {/* Search and Filter Controls */}
        <SearchAndFilter
          sortBy={sortBy}
          onSortChange={(value) =>
            setSortBy(value as "recent" | "name" | "size" | "downloaded")
          }
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchKeyPress={handleSearchKeyPress}
          selectedTags={selectedTags}
          filteredAvailableTags={filteredAvailableTags}
          onAddTag={addTagChip}
          onRemoveTag={removeTagChip}
          onClearAllTags={() => setSelectedTags([])}
        />

        {/* Main Content */}
        <div style={{ marginTop: 0 }}>
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

          {/* Image Grid */}
          <ImageGrid
            loading={loading}
            images={filteredAndSortedImages}
            onImageClick={handleImageClick}
            onClearFilters={clearFilters}
          />

          {/* Empty State for No Images Found */}
          {images.length === 0 && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "0px 16px",
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

          {/* Loading and Pagination */}
          <LoadingAndPagination
            loading={loading}
            loadingMore={loadingMore}
            pagination={pagination}
            imagesCount={filteredAndSortedImages.length}
            category={String(category)}
            onLoadMore={loadMoreImages}
          />
        </div>

        {/* Floating Action Button */}

        {/* Image Preview Modal */}
        <ImageModal
          image={selectedImage}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onDownload={handleDownload}
        />

        {/* Enhanced CSS for hover effects and animations */}
        <style jsx>{`
          .page-container {
            will-change: transform, opacity;
          }

          .page-container.page-loaded {
            transform: translateY(0) !important;
            opacity: 1 !important;
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

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          /* Responsive Design */
          @media (max-width: 1024px) {
            .image-container {
              animation-delay: 0s !important;
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

            div[style*="gridTemplateColumns"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (max-width: 480px) {
            input[type="text"] {
              font-size: 0.9rem !important;
              padding: 10px 10px 10px 40px !important;
            }
          }

          @media (min-width: 769px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }

          * {
            box-sizing: border-box;
          }
        `}</style>
      </div>
    </>
  );
}
