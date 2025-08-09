export interface Image {
  id: string;
  ipfsHash: string;
  gatewayUrl: string;
  name: string;
  size?: number;
  timestamp: string;
  tags?: string[];
  totalDownloads?: number;
  uniqueDownloads?: number;
  metadata?: {
    keyvalues?: {
      artist?: string;
      visibility?: string;
      category?: string;
      location?: string;
      tags?: string;
    };
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
