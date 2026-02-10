"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Logo {
  name: string;
  src?: string;
}

interface LogoCloudProps {
  eyebrow?: string;
  title?: string;
  logos: Logo[];
  variant?: "default" | "grayscale" | "dark";
  columns?: 4 | 5 | 6;
}

export function LogoCloud({
  eyebrow,
  title,
  logos,
  variant = "default",
  columns = 5,
}: LogoCloudProps) {
  const colClasses = {
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
  };

  const variants = {
    default: "bg-slate-50",
    grayscale: "bg-white",
    dark: "bg-slate-900",
  };

  const logoStyles = {
    default: "opacity-60 hover:opacity-100",
    grayscale: "grayscale hover:grayscale-0 opacity-50 hover:opacity-100",
    dark: "opacity-50 hover:opacity-100 brightness-200",
  };

  return (
    <section className={`py-16 ${variants[variant]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(eyebrow || title) && (
          <div className="text-center mb-10">
            {eyebrow && (
              <p
                className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
                  variant === "dark" ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h3
                className={`text-xl font-semibold ${
                  variant === "dark" ? "text-white" : "text-slate-900"
                }`}
              >
                {title}
              </h3>
            )}
          </div>
        )}

        <div className={`grid ${colClasses[columns]} gap-8 items-center`}>
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-center transition-all duration-300 ${logoStyles[variant]}`}
            >
              {logo.src ? (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <div
                  className={`h-8 flex items-center justify-center px-4 rounded font-semibold ${
                    variant === "dark"
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {logo.name}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Usage Example:
// <LogoCloud
//   eyebrow="Trusted by"
//   title="Industry Leaders"
//   logos={[
//     { name: "Acme Inc", src: "/logos/acme.svg" },
//     { name: "TechCorp", src: "/logos/techcorp.svg" },
//   ]}
//   variant="grayscale"
// />
