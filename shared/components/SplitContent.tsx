"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface SplitContentProps {
  eyebrow?: string;
  title: string;
  description: string;
  features?: {
    icon?: LucideIcon;
    title: string;
    description: string;
  }[];
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
  cta?: {
    label: string;
    href: string;
  };
}

export function SplitContent({
  eyebrow,
  title,
  description,
  features,
  imageSrc,
  imageAlt = "Feature illustration",
  imagePosition = "right",
  cta,
}: SplitContentProps) {
  const contentOrder = imagePosition === "left" ? "lg:order-2" : "";
  const imageOrder = imagePosition === "left" ? "lg:order-1" : "";

  return (
    <section className="py-20 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: imagePosition === "left" ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={contentOrder}
          >
            {eyebrow && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4">
                {eyebrow}
              </span>
            )}

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {title}
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              {description}
            </p>

            {/* Features List */}
            {features && features.length > 0 && (
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      {Icon && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0D9488]/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#0D9488]" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-slate-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA */}
            {cta && (
              <a
                href={cta.href}
                className="inline-flex items-center text-[#0D9488] font-semibold hover:underline"
              >
                {cta.label}
                <svg
                  className="ml-2 w-5 h-5"
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
              </a>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: imagePosition === "left" ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={imageOrder}
          >
            {imageSrc ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0D9488]/20 to-transparent" />
              </div>
            ) : (
              <div className="relative">
                {/* Placeholder UI */}
                <div className="bg-slate-100 rounded-2xl p-6 shadow-xl">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#F97316]" />
                      <div className="flex-1">
                        <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-20 bg-slate-50 rounded-lg" />
                      <div className="h-20 bg-slate-50 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#0D9488]/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#F97316]/10 rounded-full blur-2xl" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Usage Example:
// import { Zap, Shield, Sparkles } from "lucide-react";
//
// <SplitContent
//   eyebrow="Features"
//   title="Everything You Need to Create Amazing Presentations"
//   description="Our AI-powered platform helps you create professional presentations in minutes, not hours."
//   imageSrc="/images/feature.png"
//   features={[
//     { icon: Zap, title: "Lightning Fast", description: "Generate slides in seconds" },
//     { icon: Shield, title: "Secure", description: "Enterprise-grade security" },
//   ]}
//   cta={{ label: "Learn more", href: "#" }}
// />
