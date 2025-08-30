// IPFS Gateway Configuration
// This file centralizes all IPFS gateway URLs for easy switching

export const IPFS_CONFIG = {
  // Primary gateway (your custom Pinata gateway - fastest)
  PRIMARY_GATEWAY: 'https://copper-delicate-louse-351.mypinata.cloud/ipfs',
  
  // Fallback gateways (slower but reliable)
  FALLBACK_GATEWAYS: [
    'https://cloudflare-ipfs.com/ipfs',
    'https://gateway.pinata.cloud/ipfs',
    'https://ipfs.io/ipfs',
    'https://dweb.link/ipfs',
    'https://ipfs.fleek.co/ipfs',
    'https://cf-ipfs.com/ipfs',
  ],
  
  // Pinata specific URLs (for metadata)
  PINATA_URL: 'https://pinata.cloud/ipfs',
  
  // Gateway performance settings
  TIMEOUT_MS: 10000, // 10 seconds
  FALLBACK_DELAY_MS: 2000, // 2 seconds between fallback attempts
  MAX_RETRIES: 3,
};

// Helper function to get IPFS URL
export function getIpfsUrl(hash: string, gateway: 'primary' | 'fallback' | 'pinata' = 'primary'): string {
  switch (gateway) {
    case 'primary':
      return `${IPFS_CONFIG.PRIMARY_GATEWAY}/${hash}`;
    case 'fallback':
      // Randomly select a fallback gateway for load balancing
      const randomIndex = Math.floor(Math.random() * IPFS_CONFIG.FALLBACK_GATEWAYS.length);
      return `${IPFS_CONFIG.FALLBACK_GATEWAYS[randomIndex]}/${hash}`;
    case 'pinata':
      return `${IPFS_CONFIG.PINATA_URL}/${hash}`;
    default:
      return `${IPFS_CONFIG.PRIMARY_GATEWAY}/${hash}`;
  }
}

// Function to get all available gateways for an image hash
export function getAllIpfsUrls(hash: string): {
  primary: string;
  fallbacks: string[];
  pinata: string;
} {
  return {
    primary: getIpfsUrl(hash, 'primary'),
    fallbacks: IPFS_CONFIG.FALLBACK_GATEWAYS.map(gateway => `${gateway}/${hash}`),
    pinata: getIpfsUrl(hash, 'pinata'),
  };
}

// Gateway health check function
export async function checkGatewayHealth(gatewayUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IPFS_CONFIG.TIMEOUT_MS);
    
    const response = await fetch(`${gatewayUrl.replace('/ipfs', '')}/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme`, {
      signal: controller.signal,
      method: 'HEAD',
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`Gateway health check failed for ${gatewayUrl}:`, error);
    return false;
  }
}

// Get the fastest available gateway
export async function getFastestGateway(): Promise<string> {
  const gateways = [
    IPFS_CONFIG.PRIMARY_GATEWAY,
    ...IPFS_CONFIG.FALLBACK_GATEWAYS
  ];
  
  for (const gateway of gateways) {
    if (await checkGatewayHealth(gateway)) {
      return gateway;
    }
  }
  
  // If all fail, return primary as fallback
  return IPFS_CONFIG.PRIMARY_GATEWAY;
} 