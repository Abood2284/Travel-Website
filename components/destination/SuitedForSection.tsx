"use client";

import { motion } from "motion/react";
import { Users, Heart, Compass, Briefcase } from "lucide-react";

interface SuitedFor {
  type: string;
  description: string;
}

interface SuitedForSectionProps {
  suitedFor: SuitedFor[];
}

const iconMap: Record<string, typeof Users> = {
  "Luxury Travelers": Heart,
  Families: Users,
  "Adventure Seekers": Compass,
  "Digital Nomads": Briefcase,
  default: Users,
};

function getIcon(type: string) {
  return iconMap[type] || iconMap.default;
}

export default function SuitedForSection({ suitedFor }: SuitedForSectionProps) {
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
            Who should visit
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black tracking-tight text-gray-900">
            Perfect For
          </h2>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            This destination is ideally suited for the following types of travelers:
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {suitedFor.map((suited, index) => {
            const Icon = getIcon(suited.type);
            return (
              <motion.div
                key={suited.type}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-gray-100 p-3">
                    <Icon className="w-6 h-6 text-gray-900" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {suited.type}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {suited.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
