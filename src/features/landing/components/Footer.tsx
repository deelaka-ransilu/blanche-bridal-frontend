"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#120C08] text-[#D9C4A0] py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="text-xl font-medium tracking-widest text-[#E9D9B6] mb-3">
              BLANCHE <span className="text-[#A86A4B]">BRIDAL</span>
            </p>
            <p className="text-sm text-[#C49C74]/70 leading-relaxed">
              Piliyandala&apos;s premier bridal boutique. Making every bride
              feel extraordinary since 2014.
            </p>
          </div>
          <div>
            <p className="text-xs tracking-widest text-[#A86A4B] uppercase mb-4">
              Quick links
            </p>
            <ul className="flex flex-col gap-2">
              {["About", "Services", "Gallery", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-[#C49C74]/60 hover:text-[#D9C4A0] transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-widest text-[#A86A4B] uppercase mb-4">
              Account
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-[#C49C74]/60 hover:text-[#D9C4A0] transition-colors"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-[#C49C74]/60 hover:text-[#D9C4A0] transition-colors"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-[#C49C74]/60 hover:text-[#D9C4A0] transition-colors"
                >
                  Book appointment
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#5B3E26]/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#5B3E26]">
            &copy; 2024 Blanche Bridal. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy policy", "Terms of service", "Instagram"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-[#5B3E26] hover:text-[#C49C74] transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
