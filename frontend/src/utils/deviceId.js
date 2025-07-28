export function getDeviceId() {
    if (typeof window === 'undefined') return null; // SSR safety
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }