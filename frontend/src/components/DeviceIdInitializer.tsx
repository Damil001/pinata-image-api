"use client";
import { useEffect } from "react";
import { getDeviceId } from "@/utils/deviceId";

export default function DeviceIdInitializer() {
  useEffect(() => {
    getDeviceId();
  }, []);
  return null;
}
