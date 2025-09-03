"use client";
import { useState, useEffect, useMemo } from "react";
import { Image } from "@/components/upload";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface UseAllImagesReturn {
  images: Image[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  pagination: PaginationState;
  filteredAndSortedImages: Image[];
  allTags: string[];
  refreshImages: () => Promise<void>;
  loadMoreImages: () => Promise<void>;
}

interface UseAllImagesProps {
  searchQuery: string;
  selectedTags: string[];
  fileTypeFilter: string;
  sortBy: "recent" | "name" | "size" | "downloaded";
}

export const useAllImages = ({
  searchQuery,
  selectedTags,
  fileTypeFilter,
  sortBy,
}: UseAllImagesProps): UseAllImagesReturn => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  });

  // Helper function to remove duplicates based on ipfsHash
  const removeDuplicates = (imageArray: Image[]): Image[] => {
    const seen = new Set<string>();
    return imageArray.filter((img) => {
      if (seen.has(img.ipfsHash)) {
        return false;
      }
      seen.add(img.ipfsHash);
      return true;
    });
  };

  // Fetch images with download counts and pagination - NO CATEGORY FILTERING
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

        // NO CATEGORY FILTERING - use all images
        const allImages = imagesWithDownloads;

        console.log(
          `Loaded ${allImages.length} images from ${imagesWithDownloads.length} total images`
        );

        if (append) {
          setImages((prev) => {
            // Combine existing images with new images and remove duplicates
            const combined = [...prev, ...allImages];
            const uniqueImages = removeDuplicates(combined);
            console.log(
              `Total images after append (before dedup): ${combined.length}, after dedup: ${uniqueImages.length}`
            );
            return uniqueImages;
          });
        } else {
          // For initial load, still remove duplicates in case API returns duplicates
          const uniqueImages = removeDuplicates(allImages);
          setImages(uniqueImages);
          console.log(
            `Set initial images (before dedup): ${allImages.length}, after dedup: ${uniqueImages.length}`
          );
        }

        // Update pagination state
        const hasMorePages =
          data.pagination.page * data.pagination.limit < data.pagination.total;

        setPagination((prev) => ({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore: hasMorePages,
        }));

        console.log(
          `Pagination updated: page=${data.pagination.page}, hasMore=${hasMorePages}`
        );
      } else {
        setError("Failed to fetch images");
      }
    } catch (e) {
      setError("Failed to fetch images");
      console.error("Fetch error:", e);
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
  }, []);

  // Function to refresh images list with download counts
  const refreshImages = async () => {
    // Reset pagination when refreshing
    setPagination((prev) => ({
      ...prev,
      page: 1,
      hasMore: true,
    }));
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

  // Get all unique tags from images
  const allTags = useMemo(() => {
    return Array.from(
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
  }, [images]);

  // Filter and sort images based on all criteria
  const filteredAndSortedImages = useMemo(() => {
    let filtered = [...images];

    // Apply general search filter (includes tags, names, descriptions, and locations)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((img) => {
        // Search in name
        if (img.name.toLowerCase().includes(query)) return true;
        
        // Search in description
        if (img.description?.toLowerCase().includes(query)) return true;
        
        // Search in tags
        const imageTags = img.tags || img.metadata?.keyvalues?.tags?.split(",").map((tag) => tag.trim()) || [];
        if (imageTags.some((tag) => tag.toLowerCase().includes(query))) return true;
        
        // Search in location
        const location = img.metadata?.keyvalues?.location || "";
        if (location.toLowerCase().includes(query)) return true;
        
        return false;
      });
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

  return {
    images,
    loading,
    loadingMore,
    error,
    pagination,
    filteredAndSortedImages,
    allTags,
    refreshImages,
    loadMoreImages,
  };
};
