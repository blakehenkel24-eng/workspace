"use client";

import { motion } from "framer-motion";

interface Stat {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface StatsSectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  stats: Stat[];
  variant?: "default" | "cards" | "dark";
}

export function StatsSection({
  eyebrow,
  title,
  description,
  stats,
  variant = "default",
}: StatsSectionProps) {
  if (variant === "dark") {
    return (
      <section className="py-20 lg:py-32 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(eyebrow || title) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {eyebrow && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/20 text-[#0D9488] text-sm font-semibold mb-4">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-lg text-slate-400">{description}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2">
                  {stat.prefix}
                  <span className="text-[#0D9488]">{stat.value}</span>
                  {stat.suffix}
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "cards") {
    return (
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(eyebrow || title) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {eyebrow && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-lg text-slate-600">{description}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 lg:p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                  {stat.prefix}
                  <span className="text-[#0D9488]">{stat.value}</span>
                  {stat.suffix}
                </div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-1">
                {stat.prefix}
                <span className="text-[#F97316]">{stat.value}</span>
                {stat.suffix}
              </div>
              <div className="text-slate-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Usage Example:
// <StatsSection
//   eyebrow="Our Impact"
//   title="Trusted by Thousands"
//   stats={[
//     { value: "10K", label: "Active Users", suffix: "+" },
//     { value: "500", label: "Presentations Created", suffix: "+" },
//     { value: "99", label: "Satisfaction Rate", suffix: "%" },
//     { value: "24/7", label: "Support Available" },
//   ]}
//   variant="cards"
// />
