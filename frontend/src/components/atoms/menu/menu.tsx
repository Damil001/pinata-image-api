"use client";
import { useState } from "react";
import { Anonymous_Pro, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
const anonymousPro = Anonymous_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
});
type MenuHeadingProps = { name: string };
const MenuHeading = ({ name }: MenuHeadingProps) => {
  return (
    <div className="bg-[#444] pl-4 pt-2 pb-2 pr-4">
      <h1
        className={`text-[#ffffff] text-2xl font-bold ${anonymousPro.className}`}
      >
        {name}
      </h1>
    </div>
  );
};
export default function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full z-5000">
      <div className="fixed top-4 left-4 sm:top-8 sm:left-8 z-50">
        <div
          className="transition-transform duration-300 ease-in-out"
          style={{ display: "inline-block" }}
        >
          <Image
            src={isOpen ? "/about-button.svg" : "/about-button.svg"}
            alt="About Button"
            width={40}
            height={40}
            className={
              `cursor-pointer transition-all duration-300 ease-in-out w-8 h-8 sm:w-10 sm:h-10` +
              (isOpen ? " opacity-100 scale-110" : " opacity-80 scale-100")
            }
            onClick={() => setIsOpen((prev) => !prev)}
          />
        </div>
      </div>
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] sm:max-w-full bg-[#333639] pt-24 shadow-lg transition-transform duration-500 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        {isOpen && (
          <>
            <MenuHeading name="ANONYMITY" />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2 mt-0.5">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                Transparency is one of our core values, so in the following you
                can learn about how we built the Archive 1.0 and what that means
                for you.Fully decentralized Archive under construction.
              </p>
            </div>
            <MenuHeading name="SECURITY" />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2 mt-0.5">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                Lorem ipsum dolor sit amet consectetur. Aliquam convallis at
                accumsan nulla viverra morbi rhoncus et. Egestas consectetur nec
                commodo arcu et libero eu amet venenatis. Semper elit sem.
              </p>
            </div>
            <MenuHeading name="PARTICIPATE" />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 bg-[#EBE8E2] mb-2">
              <p
                className={`text-[#1F2123] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                Lorem ipsum dolor sit amet consectetur. Aliquam convallis at
                accumsan nulla viverra morbi rhoncus et. Egestas consectetur nec
                commodo arcu et libero eu amet venenatis. Semper elit sem.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
