const LINKS = ["Architecture", "Interiors", "Projects", "Contact"];
const SOCIALS = ["Instagram", "Pinterest", "LinkedIn"];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-charcoal px-6 py-14 lg:px-10" data-cursor-theme="dark">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
        <div className="font-display text-xl italic text-white">Meridian</div>

        <nav className="flex flex-wrap justify-center gap-6">
          {LINKS.map((link) => (
            <a
              key={link}
              href="#top"
              data-cursor-hover
              className="text-xs uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-brass-light"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex gap-6">
          {SOCIALS.map((s) => (
            <a
              key={s}
              href="#top"
              data-cursor-hover
              className="text-xs uppercase tracking-[0.14em] text-white/60 transition-colors hover:text-brass-light"
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Meridian Estates. All rights reserved.
      </p>
    </footer>
  );
}
