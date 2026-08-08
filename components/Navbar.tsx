"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const LINKS = [
  { label: "Architecture", href: "/architecture" },
  { label: "Why Us", href: "/#why-us" },
  { label: "Projects", href: "/#projects" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Contact", href: "/#cta" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isSubpage = pathname !== "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      // On home page, turn glass on when scrolling past hero top region
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while mobile menu is open
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

  const showGlass = scrolled || menuOpen || isSubpage;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        showGlass
          ? "bg-[#16130F]/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          : "bg-gradient-to-b from-black/60 via-black/20 to-transparent py-6"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="font-display text-xl italic tracking-wide text-white transition-opacity hover:opacity-80"
          data-cursor-hover
          onClick={() => setMenuOpen(false)}
        >
          Meridian
        </Link>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-8 xl:flex">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-cursor-hover
                  className={`group relative text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-colors ${
                    isActive ? "text-brass-light" : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-brass-light transition-all duration-300 ease-out ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA Button */}
        <Link
          href="/#cta"
          data-cursor-hover
          className="hidden rounded-full border border-brass-light/40 bg-brass-light/10 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-brass-light backdrop-blur-md transition-all hover:bg-brass-light hover:text-charcoal hover:scale-105 xl:inline-block"
        >
          Book Consultation
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md xl:hidden"
          data-cursor-hover
        >
          <span
            className={`h-[1.5px] w-5 bg-white transition-transform duration-300 ${
              menuOpen ? "translate-y-[4.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-5 bg-white transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[1.5px] w-5 bg-white transition-transform duration-300 ${
              menuOpen ? "-translate-y-[4.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 top-0 z-40 flex flex-col justify-between bg-charcoal/98 px-8 pt-28 pb-12 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] xl:hidden ${
          menuOpen ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-4"
        }`}
      >
        <ul className="flex flex-col gap-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-3xl font-light text-white/90 transition-colors hover:text-brass-light"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
          <Link
            href="/#cta"
            onClick={() => setMenuOpen(false)}
            className="w-full rounded-full bg-brass-light py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-charcoal"
          >
            Book Consultation
          </Link>
        </div>
      </div>
    </header>
  );
}
