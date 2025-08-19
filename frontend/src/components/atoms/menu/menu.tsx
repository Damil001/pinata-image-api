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
        className={`fixed top-0 right-0 h-full w-[90vw] bg-[#333639] pt-10 shadow-lg transition-transform duration-500 ease-in-out z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ willChange: "transform" }}
      >
        {isOpen && (
          <div className="pb-8">
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2 mt-0.5">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                Why decentralized? Because repression and surveillance are
                growing fast, and we need safe tools that cannot be censored, or
                shut down. Our first practical version of the archive (our MVP)
                is a stepping stone toward full decentralization. Because
                Transparency is one of our core values, here you can learn about
                how we built the archive, and what that means for you until we
                transition to Holochain. We&apos;re building this to last and
                withstand pressure before it escalates. Currently, we&apos;re
                using a peer-to-peer network to store & distribute the resources
                while the interface itself is still centralized, meaning we
                haven&apos;t eliminated all potentially traceable steps yet,
                which comes with our Holochain version. What&apos;s already
                decentralized: ✅ File storage & distribution via IPFS
                What&apos;s partly decentralized: ☑ Pinning ensures
                accessibility. Right now, we pin the archive&apos;s files
                through the service Pinata. The long-term vision? Collective
                hosting. Mutual care. Shared resilience. What&apos;s not yet
                decentralized: ✖ Metadata (tags, search & upload interface) &
                Hosting on Render
              </p>
            </div>
            <MenuHeading name="Shared, Not Owned" />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2 mt-0.5">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                Our vision is a self-governing archive where the community
                itself ensures the archive stays alive and operates according to
                shared principles. Right now, we maintain the archive, because
                community-based enforcement of values is currently under
                construction.
              </p>
            </div>
            <MenuHeading name="Anonymity & Safety" />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                Pinning IPFS gateways and Render-hosted tools can see requests
                coming from your IP. If you want maximum anonymity, here&apos;s
                how: If you want to make sure that your identity is fully hidden
                before we transition to Holochain, you can use a VPN or
                privacy-respecting browsers like Brave or Tor, and check out our
                Tactics Guide on how to remove metadata from files before
                uploading.
              </p>
            </div>
            <MenuHeading name="The Future with Holochain" />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                With Holochain files and metadata are fully peer-to-peer,
                eliminating central servers that could log activity—anonymity
                then is built into the network. There are no central servers to
                log activity, no gateway IPs to track, and no single point of
                failure. If WPR disappeared tomorrow, the archive would continue
                running on all participating devices. This creates a
                self-sustaining, decentralized archive built on shared
                stewardship, safety, and anonymity.
              </p>
            </div>
            <MenuHeading name="Open Contribution/ Principles" />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                This isn&apos;t a curated archive, but it is built on baseline
                values. If you align with core liberatory values,
                anti-capitalist, anti-colonial, anti-imperial, anti-Zionist,
                anti-fascist, anti-racist, this space is for you. Give what you
                can, take what you need. This is a commons, so we&apos;re
                centering the collective struggle. We reserve the right to
                remove files that go against the baseline ethics of collective
                liberation—because none of us is free until all of us are free.
                Disclaimer: Resources are open to download, print and
                distribution, not for profit. We Print Revolution is not
                responsible for how the archive&apos;s resources are used.
              </p>
            </div>
            <MenuHeading name="What brings the archive to life? Nodes." />
            <div className="pl-4 pr-4 sm:pl-6 sm:pr-6 mb-2">
              <p
                className={`text-[#EBE8E2] text-xs sm:text-sm ${ibmPlexMono.className} font-normal leading-relaxed`}
              >
                Nodes are essential points of connection, they bring the archive
                to life as a living, breathing tool for ideas, designs, tactics
                and techniques. Anyone who uses the archive—who explores,
                downloads, or contributes by uploading, is a node in our
                decentralized web of resistance. By contributing what you can,
                sharing what you know, and spreading resources, you help build a
                resilient, and self-sustaining tool beyond any single person or
                organization—because liberation is collective. Now let your
                imagination run wild… For the love of life and the love of
                humanity ❤️ We Print Revolution Building infrastructure for
                resistance
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
