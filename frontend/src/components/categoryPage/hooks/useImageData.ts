import { useState, useEffect, useMemo } from "react";
import { Image, Pagination } from "../types";

export const useImageData = (category: string) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
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
      const data: {
        success: boolean;
        images: Image[];
        pagination: { page: number; limit: number; total: number };
      } = await res.json();

      console.log(`Category ${category} - Fetching page ${page}:`, data);

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

        // Filter by category
        const filtered = imagesWithDownloads.filter(
          (img) =>
            img.metadata?.keyvalues?.category?.toLowerCase() ===
            String(category).toLowerCase()
        );

        console.log(
          `Category ${category} - Filtered ${filtered.length} images from ${imagesWithDownloads.length} total`
        );

        if (append) {
          setImages((prev) => {
            // Combine existing images with new filtered images and remove duplicates
            const combined = [...prev, ...filtered];
            const uniqueImages = removeDuplicates(combined);
            console.log(
              `Category ${category} - Total images after append (before dedup): ${combined.length}, after dedup: ${uniqueImages.length}`
            );
            return uniqueImages;
          });
        } else {
          // For initial load, still remove duplicates in case API returns duplicates
          const uniqueImages = removeDuplicates(filtered);
          setImages(uniqueImages);
          console.log(
            `Category ${category} - Set initial images (before dedup): ${filtered.length}, after dedup: ${uniqueImages.length}`
          );
        }

        const hasMorePages =
          data.pagination.page * data.pagination.limit < data.pagination.total;
        const hasMatchingImages = filtered.length > 0;

        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore:
            hasMorePages && (hasMatchingImages || data.pagination.page <= 3),
        });

        console.log(
          `Category ${category} - Pagination updated: page=${
            data.pagination.page
          }, hasMore=${
            hasMorePages && (hasMatchingImages || data.pagination.page <= 3)
          }`
        );
      } else {
        setError("Failed to fetch images");
      }
    } catch (e) {
      setError("Failed to fetch images");
      console.error(`Category ${category} - Fetch error:`, e);
    }

    if (!append) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    // Reset images and pagination when category changes
    setImages([]);
    setPagination((prev) => ({
      ...prev,
      page: 1,
      hasMore: true,
    }));
    fetchImages(1, false);
  }, [category]);

  // Load more images
  const loadMoreImages = async () => {
    if (!loadingMore && pagination.hasMore) {
      console.log(
        `Category ${category} - Loading more images, current page: ${pagination.page}, hasMore: ${pagination.hasMore}`
      );
      await fetchImages(pagination.page + 1, true);
    }
  };

  // Refresh images list
  const refreshImages = async () => {
    // Reset pagination when refreshing
    setPagination((prev) => ({
      ...prev,
      page: 1,
      hasMore: true,
    }));
    await fetchImages(1, false);
  };

  return {
    images,
    loading,
    loadingMore,
    error,
    pagination,
    loadMoreImages,
    refreshImages,
  };
};
