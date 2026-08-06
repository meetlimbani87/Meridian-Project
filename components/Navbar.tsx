"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { label: "Architecture", href: "#showcase" },
  { label: "Why Us", href: "#why-us" },
  { label: "Projects", href: "#projects" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#cta" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > window.innerHeight * 0.92);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled ? "glass-dark py-4" : "bg-transparent py-7"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
        <a
          href="#top"
          className="font-display text-lg italic tracking-wide text-white"
          data-cursor-hover
        >
          Meridian
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-cursor-hover
                className="group relative text-[0.78rem] font-medium uppercase tracking-[0.14em] text-white/80 transition-colors hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-brass-light transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#cta"
          data-cursor-hover
          className="hidden rounded-full border border-white/30 px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-brass-light hover:text-brass-light md:inline-block"
        >
          Book Consultation
        </a>
      </nav>
    </header>
  );
}
