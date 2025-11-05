"use client";

import { motion } from "motion/react";

interface DestinationHighlight {
  category: string;
  items: string[];
}

interface DestinationHighlightsProps {
  highlights: DestinationHighlight[];
}

export default function DestinationHighlights({
  highlights,
}: DestinationHighlightsProps) {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <header className="mb-10 max-w-3xl">
          <span className="text-[0.75rem] uppercase tracking-[0.4em] text-gray-500">
            Discover more
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-gray-900">
            Highlights by Category
          </h2>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-5">
                {highlight.category}
              </h3>
              <ul className="space-y-3">
                {highlight.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <span className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
