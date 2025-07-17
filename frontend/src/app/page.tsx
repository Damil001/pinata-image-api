import MenuItem from "@/components/atoms/menu-item/menu-item";
import { Anonymous_Pro, IBM_Plex_Mono } from "next/font/google";

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
  "FLIERS",
  "BANNERS",
  "PAMPHLETS",
  "???",
  "TACTICS",
  "TECHNIQUES",
  "TBD",
];

export default function Home() {
  return (
    <div className="p-4 max-w-screen-lg mx-auto pt-4">
      <h3
        className={anonymousPro.className}
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#EBE8E2",
          textAlign: "right",
          lineHeight: "1",
        }}
      >
        ENTER THE
      </h3>
      <h1
        className={anonymousPro.className}
        style={{
          fontSize: "4rem",
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
        className={ibmPlexMono.className}
        style={{
          fontSize: "0.75rem",
          fontWeight: "400",
          color: "#EBE8E2",
          textAlign: "right",
          lineHeight: "1",
          marginBottom: "0.25rem",
        }}
      >
        Here is Caro’s super-simple, yet super-inspiring words that encapsulate
        the purpose and ethos of{" "}
        <span
          style={{
            fontWeight: "600",
          }}
        >
          {" "}
          We Print Revolution
        </span>{" "}
        We Print Revolution and this, the Archive repository for important
        designs that have been banned around the world.
      </p>
      <div className="mb-1.5rem" />
      <div className="flex flex-col gap-4">
        {menuContent.map((item, index) => {
          return <MenuItem key={index} menuText={item} hrefLink={`/${item}`} />;
        })}
      </div>
    </div>
  );
}
