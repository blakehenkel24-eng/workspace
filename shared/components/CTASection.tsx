"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface CTASectionProps {
  variant?: "default" | "gradient" | "dark" | "split";
  title: string;
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  badge?: string;
}

export function CTASection({
  variant = "default",
  title,
  description,
  primaryCta = { label: "Get Started", href: "/signup" },
  secondaryCta,
  badge,
}: CTASectionProps) {
  const variants = {
    default: {
      wrapper: "bg-[#0D9488]",
      title: "text-white",
      description: "text-white/80",
    },
    gradient: {
      wrapper: "bg-gradient-to-r from-[#0D9488] to-[#F97316]",
      title: "text-white",
      description: "text-white/80",
    },
    dark: {
      wrapper: "bg-slate-900",
      title: "text-white",
      description: "text-slate-400",
    },
    split: {
      wrapper: "bg-white border-2 border-[#0D9488]",
      title: "text-slate-900",
      description: "text-slate-600",
    },
  };

  const styles = variants[variant];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={`relative overflow-hidden rounded-3xl ${styles.wrapper} px-6 py-16 lg:px-16 lg:py-20`}
        >
          {/* Background Decorations */}
          {variant !== "split" && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </>
          )}

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {badge && (
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${variant === "split" ? "bg-[#0D9488]/10 text-[#0D9488]" : "bg-white/20 text-white"}`}>
                <Sparkles className="w-4 h-4" />
                {badge}
              </span>
            )}

            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${styles.title}`}>
              {title}
            </h2>

            {description && (
              <p className={`text-lg lg:text-xl mb-10 max-w-2xl mx-auto ${styles.description}`}>
                {description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className={
                  variant === "split"
                    ? "bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-6 text-lg rounded-xl"
                    : "bg-white text-[#0D9488] hover:bg-white/90 px-8 py-6 text-lg rounded-xl shadow-lg"
                }
                asChild
              >
                <a href={primaryCta.href}>
                  {primaryCta.label}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>

              {secondaryCta && (
                <Button
                  size="lg"
                  variant={variant === "split" ? "outline" : "outline"}
                  className={
                    variant === "split"
                      ? "border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488]/10 px-8 py-6 text-lg rounded-xl"
                      : "border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                  }
                  asChild
                >
                  <a href={secondaryCta.href}>{secondaryCta.label}</a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Usage Examples:
// <CTASection
//   variant="gradient"
//   badge="Limited Time Offer"
//   title="Ready to Transform Your Presentations?"
//   description="Join thousands of professionals who trust SlideTheory."
//   primaryCta={{ label: "Start Free Trial", href: "/trial" }}
//   secondaryCta={{ label: "Contact Sales", href: "/sales" }}
// />
