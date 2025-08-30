"use client";
import MenuItem from "@/components/atoms/menu-item/menu-item";
import Menu from "@/components/atoms/menu/menu";
import Link from "next/link";
import { Anonymous_Pro, IBM_Plex_Mono } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import FAQModal from "@/components/FAQModal";

const anonymousPro = Anonymous_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
});

const menuContent = [
  "POSTERS",
  "STICKERS",
  "FLYERS",
  "PAMPHLETS",
  "TACTICS",
  "TECHNIQUES",
  "BANNERS",
  "ALL RESOURCES",
  "FAQ",
];

export default function Home() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);

  useEffect(() => {
    if (buttonRef.current) {
      // Trigger the animation by adding the class after component mounts
      setTimeout(() => {
        buttonRef.current?.classList.add("bounce-in-up");
      }, 100);
    }
  }, []);

  return (
    <>
      <main className="p-4 max-w-screen-xl mx-auto pt-4" role="main">
        <Menu />
        <header role="banner">
          <h3
            className={`${anonymousPro.className} text-xl sm:text-2xl md:text-3xl lg:text-4xl`}
            style={{
              fontWeight: "700",
              color: "#EBE8E2",
              textAlign: "right",
              lineHeight: "1",
            }}
          >
            ENTER THE
          </h3>
          <h1
            className={`${anonymousPro.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl`}
            style={{
              fontWeight: "700",
              color: "#EBE8E2",
              textAlign: "right",
              lineHeight: "1",
              marginBottom: "0.25rem",
            }}
          >
            ARCHIVE
          </h1>
          <p
            className={`${ibmPlexMono.className} text-xs sm:text-sm intro-text`}
            style={{
              fontWeight: "400",
              color: "#EBE8E2",
              marginBottom: "0.15rem",
              maxWidth: "100%",
            }}
          >
            Welcome. This tool isn&apos;t about preservation, it&apos;s about
            preparation. Some archives collect dust. Not us, we collect
            resistance. This is your playground, now choose your path: Explore
            the archive&apos;s categories, or follow the protest sign.
          </p>
        </header>
        <nav role="navigation" aria-label="Archive categories">
          <div className="mb-5" />
          <div className="flex flex-col gap-4">
            {menuContent.map((item, index) => {
              // Handle FAQ clicks to open modal instead of navigation
              if (item === "FAQ") {
                return (
                  <div
                    key={index}
                    className="cursor-pointer"
                    onClick={() => setIsFAQModalOpen(true)}
                  >
                    <MenuItem menuText={item} hrefLink="#" />
                  </div>
                );
              }

              // Map "ALL RESOURCES" to the all-images route
              const hrefLink =
                item === "ALL RESOURCES" ? "/all-images" : `/${item}`;
              return (
                <MenuItem key={index} menuText={item} hrefLink={hrefLink} />
              );
            })}
          </div>
        </nav>
      </main>

      {/* FAQ Modal */}
      <FAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
      />
    </>
  );
}
