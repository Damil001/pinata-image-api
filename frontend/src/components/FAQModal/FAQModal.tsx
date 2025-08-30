"use client";
import React from "react";
import { Anonymous_Pro, IBM_Plex_Mono } from "next/font/google";

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

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <div className="absolute top-0 left-0 w-full z-5000">
      {/* Backdrop overlay for clicking outside */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-500 ease-in-out z-30 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[90vw] bg-[#333639] pt-6 shadow-lg transition-all duration-500 ease-in-out z-40 overflow-y-auto ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        <div className="pb-8">
          {/* Close Button */}
          <div className="flex justify-end pr-4 pt-2">
            <button
              onClick={onClose}
              className="text-[#EBE8E2] hover:text-white transition-colors duration-200 text-2xl font-bold cursor-pointer p-2 hover:bg-[#444] rounded"
              aria-label="Close FAQ"
            >
              ✕
            </button>
          </div>

          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4">
            <div
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed space-y-4`}
            >
              <h1
                className={`text-[#ffffff] text-3xl font-bold ${anonymousPro.className} mb-6 text-center`}
              >
                FAQ
              </h1>

              <div>
                <p className="font-semibold text-lg">What is the archive?</p>
                <p>
                  The archive says: we will persevere—even in secret, even in
                  silence, even in exile.
                </p>
                <p>
                  Think of the archive as a mycelium network where resources get
                  distributed freely beneath the surface. The archive is a
                  decentralized space to share and get access to resources
                  related to printing resistance—but think beyond printing.
                </p>
              </div>

              <div>
                <p className="font-semibold text-lg">
                  What is We Print Revolution?
                </p>
                <p>
                  Follow us on Threads and Instagram. More info will be added
                  here soon.
                </p>
              </div>
            </div>
          </div>

          <MenuHeading name="Principles" />
          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4 mt-2">
            <div
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed space-y-2`}
            >
              <div>
                <p className="font-semibold">Shared, Not Owned:</p>
                <p>
                  Our vision is a self-governing archive where the community
                  itself ensures the archive stays alive and operates according
                  to shared principles. Right now, we maintain the archive, and
                  self-governance comes with our transition to Holochain.
                </p>
              </div>

              <div>
                <p className="font-semibold">Anonymity & Safety:</p>
                <p>
                  Pinning IPFS gateways and Render-hosted tools can see requests
                  coming from your IP. If you want maximum anonymity before we
                  transition to Holochain, you can use a VPN or
                  privacy-respecting browsers like Brave or Tor, and check out
                  our Tactics Guide Pre-Holochain Anonymity: A Guide to VPN.
                </p>
              </div>

              <div>
                <p className="font-semibold">Open Contribution/Values:</p>
                <p>
                  This isn&apos;t a curated archive, but it is built on baseline
                  values. If you align with core liberatory values
                  anti-capitalist, anti-imperial, anti-Zionist, anti-fascist,
                  this space is for you. Give what you can, take what you need.
                  This is a commons, so we&apos;re centering the collective
                  struggle.
                </p>
                <p>
                  We reserve the right to remove files that go against the
                  baseline ethics of collective liberation—because none of us is
                  free until all of us are free.
                </p>
                <p>
                  <strong>Disclaimer:</strong> Resources are open to download,
                  print and distribution, not for profit. We Print Revolution is
                  not responsible for how the archive&apos;s resources are used.
                </p>
              </div>
            </div>
          </div>

          <MenuHeading name="What is IPFS?" />
          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4 mt-2">
            <p
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
            >
              The first and current version of the archive is built with IPFS
              which stands for Interplanetary File System. IPFS is a system for
              storing and sharing files across many computers instead of one
              central server. Each file has a unique code, so it can be found
              and accessed anywhere on the network. This makes files resilient,
              permanent, and hard to censor, and lets people share content
              directly without relying on a single company or server.
            </p>
          </div>

          <MenuHeading name="How is the archive built?" />
          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4 mt-2">
            <div
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed space-y-2`}
            >
              <div>
                <p className="font-semibold">What&apos;s decentralized:</p>
                <p>✅ File storage & distribution via IPFS</p>
              </div>

              <div>
                <p className="font-semibold">
                  What&apos;s partly decentralized:
                </p>
                <p>
                  ☑ Pinning ensures accessibility. Right now, we pin the
                  archive&apos;s files through the service Piñata. The long-term
                  vision? Collective hosting. Mutual care. Shared resilience.
                </p>
              </div>

              <div>
                <p className="font-semibold">
                  What&apos;s not yet decentralized:
                </p>
                <p>
                  ✖ Metadata (tags, search & upload interface) & Hosting on
                  Render
                </p>
              </div>
            </div>
          </div>

          <MenuHeading name="The Future with Holochain" />
          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4 mt-2">
            <div
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed space-y-2`}
            >
              <p>
                Holochain is a system that lets websites and tools run directly
                on users&apos; devices, instead of relying on a central server.
              </p>
              <p>
                With Holochain, files and metadata are fully peer-to-peer,
                eliminating central servers that could log activity—anonymity is
                built into the network. There are no central servers to log
                activity, no gateway IPs to track, and no single point of
                failure.
              </p>
              <p className="font-semibold">
                If We Print Revolution (WPR) disappeared tomorrow, the archive
                would continue running on all participating devices.
              </p>
              <p>
                This creates a self-sustaining, decentralized archive built on
                shared stewardship, safety, and anonymity.
              </p>
            </div>
          </div>

          <MenuHeading name="What are Nodes?" />
          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4 mt-2">
            <div
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed space-y-2`}
            >
              <p>
                Nodes are essential points of connection, they bring the archive
                to life as a living, breathing tool for ideas, designs, tactics
                and techniques.
              </p>
              <p>
                Anyone who uses the archive—who explores, downloads, or
                contributes by uploading, is a node in our decentralized web of
                resistance.
              </p>
              <p>
                By contributing what you can, sharing what you know, and
                spreading resources, you help build a resilient, and
                self-sustaining tool beyond any single person or
                organization—because liberation is collective.
              </p>
            </div>
          </div>

          <MenuHeading name="Contact" />
          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4 mt-2">
            <p
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
            >
              Questions, requests, or something else? Send us a DM on Instagram,
              or an email to weprintrevolution@proton.me
            </p>
          </div>

          <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-4 mt-2">
            <div
              className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed space-y-2 text-center`}
            >
              <p className="mt-4 italic">
                Now let your imagination run wild… For the love of life and the
                love of humanity ♥️
              </p>
              <p className="mt-4 font-bold">We Print Revolution</p>
              <p className="mt-1 italic">
                Building infrastructure for resistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
