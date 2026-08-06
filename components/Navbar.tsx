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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > window.innerHeight * 0.92);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile menu is open, and close it
  // automatically if the viewport is resized up past the breakpoint where
  // the full inline nav takes over.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    function onResize() {
      if (window.innerWidth >= 1280) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled || menuOpen ? "glass-dark py-4" : "bg-gradient-to-b from-black/45 via-black/15 to-transparent py-7"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
        <a
          href="#top"
          className="font-display text-lg italic tracking-wide text-white"
          data-cursor-hover
          onClick={() => setMenuOpen(false)}
        >
          Meridian
        </a>

        <ul className="hidden items-center gap-7 xl:flex">
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
          className="hidden rounded-full border border-white/30 px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-brass-light hover:text-brass-light xl:inline-block"
        >
          Book Consultation
        </a>

        {/* Mobile/tablet menu toggle — a simple animated hamburger / close
            icon. Visible below xl, mirroring the links/button it controls.
            The full inline nav needs real desktop width (logo + 5 links +
            a pill button) to not crowd together, so this covers phones
            and tablets both rather than just phones. */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          data-cursor-hover
          className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-[5px] xl:hidden"
        >
          <span
            className={`h-px w-6 bg-white transition-all duration-300 ease-out ${
              menuOpen ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-white transition-all duration-300 ease-out ${
              menuOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] xl:hidden ${
          menuOpen ? "max-h-[26rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 pb-8 pt-4">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                data-cursor-hover
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-base font-medium uppercase tracking-[0.1em] text-white/85 transition-colors hover:text-brass-light"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <a
              href="#cta"
              data-cursor-hover
              onClick={() => setMenuOpen(false)}
              className="inline-block rounded-full border border-white/30 px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:border-brass-light hover:text-brass-light"
            >
              Book Consultation
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
