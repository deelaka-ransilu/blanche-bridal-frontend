"use client";
import { FloatingNav } from "@/components/ui/floating-navbar";

const navItems = [
  { name: "About", link: "#about" },
  { name: "Services", link: "#services" },
  { name: "Gallery", link: "#gallery" },
  { name: "Our story", link: "#story" },
  { name: "Contact", link: "#contact" },
];

export default function LandingNav() {
  return (
    <FloatingNav
      navItems={navItems}
      className="border border-[#e8d8cc] bg-[#fffaf7]/90 backdrop-blur-md"
    />
  );
}
