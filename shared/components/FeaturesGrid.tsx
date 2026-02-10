"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "teal" | "orange" | "slate";
}

interface FeaturesGridProps {
  eyebrow?: string;
  title: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

const colorVariants = {
  teal: {
    bg: "bg-[#0D9488]/10",
    icon: "text-[#0D9488]",
    border: "group-hover:border-[#0D9488]/30",
  },
  orange: {
    bg: "bg-[#F97316]/10",
    icon: "text-[#F97316]",
    border: "group-hover:border-[#F97316]/30",
  },
  slate: {
    bg: "bg-slate-100",
    icon: "text-slate-600",
    border: "group-hover:border-slate-300",
  },
};

export function FeaturesGrid({
  eyebrow,
  title,
  description,
  features,
  columns = 3,
}: FeaturesGridProps) {
  const colClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {eyebrow && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4">
              {eyebrow}
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Grid */}
        <div className={`grid grid-cols-1 ${colClasses[columns]} gap-6 lg:gap-8`}>
          {features.map((feature, index) => {
            const colors = colorVariants[feature.color || "teal"];
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative p-6 lg:p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 ${colors.border}`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}
                >
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center`}>
                    <svg
                      className={`w-4 h-4 ${colors.icon}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Usage Example:
// import { Zap, Shield, BarChart, Users } from "lucide-react";
//
// <FeaturesGrid
//   eyebrow="Features"
//   title="Everything You Need"
//   features={[
//     { icon: Zap, title: "Lightning Fast", description: "...", color: "teal" },
//     { icon: Shield, title: "Secure by Default", description: "...", color: "orange" },
//   ]}
// />
