"use client";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700"],
});

interface MenuItemProps {
  menuText: string;
  hrefLink: string;
}

const MenuItem = ({ menuText, hrefLink }: MenuItemProps) => {
  return (
    <div className={orbitron.className}>
      <div className="border-t-2 border-[#EBE8E2] pt-[1px] pb-[1px] text-[1.875rem] text-[#EBE8E2]">
        <a
          href={hrefLink}
          className="m-0 no-underline text-[#EBE8E2] hover:text-[#FFD700] transition-colors duration-200"
        >
          {menuText}
        </a>
      </div>
    </div>
  );
};

export default MenuItem;
