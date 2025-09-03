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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
