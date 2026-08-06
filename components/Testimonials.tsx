"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Isabelle Moreau",
    role: "Villa Aurea, Dubai",
    quote:
      "Meridian understood the life we wanted before we could fully describe it ourselves. The home feels like it was always meant to be there.",
    image: "/projects/villa-aurea.jpg",
  },
  {
    name: "Daniel Whitfield",
    role: "Casa Marbella, Spain",
    quote:
      "From the first sketch to the final key, the process felt considered rather than transactional. Every detail earns its place.",
    image: "/projects/casa-marbella.jpg",
  },
  {
    name: "Amara Osei",
    role: "The Olive Estate, Italy",
    quote:
      "The interiors team has an extraordinary eye. Our home feels calm, warm, and entirely our own.",
    image: "/projects/testimonial-olive-estate.jpg",
  },
];

const easeExpo = [0.16, 1, 0.3, 1] as const;

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-ivory px-6 py-24 lg:px-10" data-cursor-theme="light">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: easeExpo }}
          className="text-center font-display text-4xl font-light text-charcoal sm:text-5xl"
        >
          What Our Clients Say
        </motion.h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease: easeExpo, delay: i * 0.12 }}
              className="glass-light rounded-md p-8 shadow-[0_20px_60px_-24px_rgba(22,19,15,0.15)]"
            >
              <blockquote className="font-display text-lg font-light italic leading-relaxed text-charcoal">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <img
                  src={t.image}
                  alt={t.name}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-charcoal">{t.name}</div>
                  <div className="text-xs text-taupe">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
