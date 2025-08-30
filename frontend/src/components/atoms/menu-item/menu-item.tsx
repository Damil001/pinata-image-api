"use client";
import { Orbitron } from "next/font/google";
import { useState, useEffect, useRef, useCallback, use } from "react";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700"],
});

interface MenuItemProps {
  menuText: string;
  hrefLink: string;
}

const MenuItem = ({ menuText, hrefLink }: MenuItemProps) => {
  const [animationState, setAnimationState] = useState<
    "idle" | "clicked" | "other"
  >("idle");
  const itemRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reset = () => setAnimationState("idle");

    // Reset when the component first mounts
    reset();

    // Reset when coming back from bfcache
    window.addEventListener("pageshow", reset);

    return () => {
      window.removeEventListener("pageshow", reset);
    };
  }, []);

  // Helper functions to determine animation classes and transforms
  const getMaskAnimationClass = (): string => {
    switch (animationState) {
      case "clicked":
        return "animate-slide-left";
      case "other":
        return "animate-slide-right";
      case "idle":
      default:
        return "";
    }
  };

  const getMaskTransform = (): string => {
    switch (animationState) {
      case "clicked":
        return "translateX(0%)";
      case "other":
        return "translateX(0%)";
      case "idle":
      default:
        return "translateX(-100%)";
    }
  };

  // Listen for animation events from other menu items
  useEffect(() => {
    const handleMenuItemClick = (event: CustomEvent) => {
      const { clickedText, allItems } = event.detail;

      if (clickedText === menuText) {
        // This is the clicked item
        setAnimationState("clicked");
      } else if (allItems.includes(menuText)) {
        // This is one of the other items
        setAnimationState("other");
      }
    };

    document.addEventListener(
      "menuItemClicked",
      handleMenuItemClick as EventListener
    );

    return () => {
      document.removeEventListener(
        "menuItemClicked",
        handleMenuItemClick as EventListener
      );
    };
  }, [menuText]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      console.log(`MenuItem clicked: ${menuText}, href: ${hrefLink}`);

      // Don't navigate for placeholder items
      if (menuText === "???" || menuText === "TBD" || menuText === "FAQ") {
        e.preventDefault();
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Get all menu items
      const allMenuItems = document.querySelectorAll("[data-menu-item]");
      const allMenuTexts = Array.from(allMenuItems).map(
        (item) => item.querySelector("a")?.textContent || ""
      );

      // Dispatch custom event to trigger animations
      const event = new CustomEvent("menuItemClicked", {
        detail: {
          clickedText: menuText,
          allItems: allMenuTexts,
        },
      });
      document.dispatchEvent(event);

      // Navigate after animation completes
      setTimeout(() => {
        window.location.href = hrefLink;
      }, 800); // Increased timeout to ensure animation completes
    },
    [menuText, hrefLink]
  );

  // Reset animation state - but don't reset during active navigation
  const resetAnimation = useCallback(() => {
    // Don't reset if we're in clicked or other state (navigation in progress)
    if (animationState === "idle") {
      setAnimationState("idle");
    }
  }, [animationState]);

  return (
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        .animate-slide-left {
          animation: slideInLeft 0.7s ease-in-out forwards;
        }

        .animate-slide-right {
          animation: slideInRight 0.7s ease-in-out forwards;
        }

        /* Ensure masks stay visible after animation completes */
        .animate-slide-left {
          animation-fill-mode: forwards;
        }

        .animate-slide-right {
          animation-fill-mode: forwards;
        }
      `}</style>

      <div
        ref={itemRef}
        data-menu-item
        className={`${orbitron.className} relative overflow-hidden`}
        onAnimationEnd={resetAnimation}
      >
        <div className="border-t-2 border-[#EBE8E2] pt-[1px] pb-[1px] text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#EBE8E2] relative z-10">
          <a
            href={hrefLink}
            onClick={handleClick}
            className="m-0 no-underline text-[#EBE8E2] transition-colors duration-200 break-words block"
          >
            {menuText}
          </a>
        </div>

        {/* Mask overlay */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-[#1f2123] z-20 ${getMaskAnimationClass()}`}
          style={{
            transform: getMaskTransform(),
          }}
        />
      </div>
    </>
  );
};

export default MenuItem;
