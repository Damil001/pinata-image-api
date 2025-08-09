import { useEffect, useState } from "react";

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("deviceId", id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
};
