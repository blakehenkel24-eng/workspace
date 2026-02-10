"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  title: string;
  titleHighlight?: string;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  showVideoButton?: boolean;
  showGridPattern?: boolean;
}

export function HeroSection({
  title,
  titleHighlight,
  description,
  primaryCta = { label: "Get Started Free", href: "/signup" },
  secondaryCta = { label: "Watch Demo", href: "/demo" },
  showVideoButton = true,
  showGridPattern = true,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Background Pattern */}
      {showGridPattern && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      )}
      
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#0D9488]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#F97316]/20 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
            New Features Available
          </span>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6">
            {title}{" "}
            {titleHighlight && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-[#F97316]">
                {titleHighlight}
              </span>
            )}
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#0D9488]/25 transition-all hover:shadow-xl hover:shadow-[#0D9488]/30 hover:-translate-y-0.5"
              asChild
            >
              <a href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>

            {showVideoButton ? (
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-6 text-lg rounded-xl"
                asChild
              >
                <a href={secondaryCta.href}>
                  <Play className="mr-2 w-5 h-5 text-[#F97316]" />
                  {secondaryCta.label}
                </a>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-100 px-8 py-6 text-lg rounded-xl"
                asChild
              >
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            )}
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex items-center justify-center gap-8 text-slate-500 text-sm">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600"
                >
                  U{i}
                </div>
              ))}
            </div>
            <p>
              Trusted by <span className="font-semibold text-slate-900">2,000+</span> teams worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Usage Example:
// <HeroSection
//   title="Build Better"
//   titleHighlight="Presentations"
//   description="Create stunning slides in minutes with AI-powered design tools that understand your brand and message."
// />
