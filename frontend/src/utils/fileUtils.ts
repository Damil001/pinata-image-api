/**
 * Utility functions for file type detection and handling
 */

export const isPDFFile = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.pdf');
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
  const lowerFileName = fileName.toLowerCase();
  return imageExtensions.some(ext => lowerFileName.endsWith(ext));
};

export const getFileType = (fileName: string): 'image' | 'pdf' | 'unknown' => {
  if (isPDFFile(fileName)) return 'pdf';
  if (isImageFile(fileName)) return 'image';
  return 'unknown';
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidIPFSHash = (hash: string): boolean => {
  // Check for common IPFS hash formats
  const ipfsHashPattern = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafybei[a-z2-7]{52}|bafkrei[a-z2-7]{52}|bafkreig[a-z2-7]{52})$/;
  return ipfsHashPattern.test(hash);
};

export const getIPFSGatewayUrl = (hash: string, gateway: string = 'https://ipfs.io/ipfs'): string => {
  if (!isValidIPFSHash(hash)) {
    console.warn(`Invalid IPFS hash: ${hash}`);
    return '';
  }
  return `${gateway}/${hash}`;
};
