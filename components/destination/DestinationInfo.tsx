"use client";

import { motion } from "motion/react";
import { Calendar, DollarSign, Globe } from "lucide-react";

interface DestinationInfoProps {
  highlights: string[];
  bestTimeToVisit: string;
  currency: string;
  language: string;
}

export default function DestinationInfo({
  highlights,
  bestTimeToVisit,
  currency,
  language,
}: DestinationInfoProps) {
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
            Why visit
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-gray-900">
            What Makes This Place Special
          </h2>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Highlights */}
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-md transition-shadow md:p-9">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Top Highlights
            </h3>
            <ul className="space-y-4">
              {highlights.map((highlight, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <span className="text-gray-900 text-lg flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-sm leading-relaxed md:text-base">{highlight}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Quick Facts */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-md transition-shadow md:p-9">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Quick Facts
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Best Time to Visit
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {bestTimeToVisit}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <DollarSign className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Currency
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {currency}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-gray-900 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Language
                    </p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {language}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
