"use client";
import MenuItem from "@/components/atoms/menu-item/menu-item";
import Menu from "@/components/atoms/menu/menu";
import Link from "next/link";
import { Anonymous_Pro, IBM_Plex_Mono } from "next/font/google";
import { useEffect, useRef } from "react";

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
  "BANNERS",
  "PAMPHLETS",
  "???",
  "TACTICS",
  "TECHNIQUES",
  "TBD",
];

export default function Home() {
  const buttonRef = useRef<HTMLDivElement>(null);

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
              marginBottom: "0.25rem",
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
          <div className="mb-10" />
          <div className="flex flex-col gap-4">
            {menuContent.map((item, index) => {
              return (
                <MenuItem key={index} menuText={item} hrefLink={`/${item}`} />
              );
            })}
          </div>
        </nav>
      </main>

      {/* Bottom right button */}
      <Link href="/all-images" aria-label="View all images in the archive">
        <div
          ref={buttonRef}
          role="button"
          tabIndex={0}
          className="fixed bottom-0 right-4 cursor-pointer hover:opacity-80 transition-opacity bounce-in-up"
          style={{
            zIndex: 1000,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              window.location.href = "/all-images";
            }
          }}
        >
          <img
            src="/sign-banner.svg"
            alt="View All Images"
            width={157}
            height={116}
            className="w-36 h-auto sm:w-44 md:w-38 lg:w-42"
          />
        </div>
      </Link>
    </>
  );
}
