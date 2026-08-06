"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 250, suffix: "+", label: "Luxury Homes" },
  { value: 18, suffix: "+", label: "Years Experience" },
  { value: 120, suffix: "+", label: "Interior Projects" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) requestAnimationFrame(tick);
    }
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

const easeExpo = [0.16, 1, 0.3, 1] as const;

export default function Statistics() {
  return (
    <section className="bg-ivory px-6 py-24 lg:px-10" data-cursor-theme="light">
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8, ease: easeExpo, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="font-display text-5xl font-light text-brass sm:text-6xl">
              <Counter value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="eyebrow mt-4 text-taupe">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
