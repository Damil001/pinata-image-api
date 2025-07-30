"use client";
import { useState } from "react";
import { UseModalAnimationReturn } from "../types/upload.types";

export const useModalAnimation = (): UseModalAnimationReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const openModal = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  };

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return {
    isVisible,
    isAnimating,
    openModal,
    closeModal,
  };
};