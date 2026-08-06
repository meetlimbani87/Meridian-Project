"use client";

import { motion } from "framer-motion";

const PROJECTS = [
  { name: "Villa Aurea", location: "Palm Jumeirah, Dubai", image: "/projects/villa-aurea.jpg" },
  { name: "Casa Marbella", location: "Marbella, Spain", image: "/projects/casa-marbella.jpg" },
  { name: "The Olive Estate", location: "Como, Italy", image: "/projects/the-olive-estate.jpg" },
  { name: "Villa Solstice", location: "Malibu, California", image: "/projects/villa-solstice.jpg" },
];

const easeExpo = [0.16, 1, 0.3, 1] as const;

export default function FeaturedProjects() {
  return (
    <section id="projects" className="bg-charcoal px-6 py-24 lg:px-10" data-cursor-theme="dark">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: easeExpo }}
          className="font-display text-4xl font-light text-white sm:text-5xl"
        >
          Featured Projects
        </motion.h2>

        <div className="mt-14 flex gap-5 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PROJECTS.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: easeExpo, delay: i * 0.1 }}
              data-cursor-hover
              className="group relative h-[420px] w-[300px] shrink-0 overflow-hidden rounded-sm sm:w-[340px]"
            >
              <img
                src={project.image}
                alt={project.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="eyebrow max-h-0 -translate-y-2 overflow-hidden text-brass-light opacity-0 transition-all duration-500 ease-out group-hover:max-h-6 group-hover:translate-y-0 group-hover:opacity-100">
                  {project.location}
                </p>
                <h3 className="mt-2 font-display text-2xl font-light text-white">
                  {project.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
