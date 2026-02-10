"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  cta: {
    label: string;
    href: string;
  };
  popular?: boolean;
  badge?: string;
}

interface PricingSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  tiers: PricingTier[];
}

export function PricingSection({
  eyebrow,
  title,
  description,
  tiers,
}: PricingSectionProps) {
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
            <p className="text-lg text-slate-600">{description}</p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 lg:p-8 ${
                tier.popular
                  ? "bg-slate-900 text-white ring-4 ring-[#0D9488] ring-offset-4"
                  : "bg-slate-50 text-slate-900 border border-slate-200"
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold ${
                    tier.popular
                      ? "bg-[#F97316] text-white"
                      : "bg-[#0D9488] text-white"
                  }`}
                >
                  {tier.badge}
                </span>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <p
                  className={`text-sm ${
                    tier.popular ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl lg:text-5xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span
                    className={`text-lg ${
                      tier.popular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {tier.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          tier.popular
                            ? "bg-[#0D9488]"
                            : "bg-[#0D9488]/10"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            tier.popular ? "text-white" : "text-[#0D9488]"
                          }`}
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          tier.popular ? "bg-slate-800" : "bg-slate-200"
                        }`}
                      >
                        <X
                          className={`w-3 h-3 ${
                            tier.popular ? "text-slate-500" : "text-slate-400"
                          }`}
                        />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? ""
                          : tier.popular
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={`w-full py-6 rounded-xl font-semibold ${
                  tier.popular
                    ? "bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
                asChild
              >
                <a href={tier.cta.href}>{tier.cta.label}</a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Usage Example:
// <PricingSection
//   eyebrow="Pricing"
//   title="Simple, Transparent Pricing"
//   tiers={[
//     {
//       name: "Starter",
//       price: "$0",
//       period: "/month",
//       description: "For individuals getting started",
//       features: [
//         { text: "5 presentations", included: true },
//         { text: "Basic templates", included: true },
//         { text: "Export to PDF", included: false },
//       ],
//       cta: { label: "Get Started", href: "/signup" },
//     },
//     {
//       name: "Pro",
//       price: "$29",
//       period: "/month",
//       description: "For growing teams",
//       features: [
//         { text: "Unlimited presentations", included: true },
//         { text: "Premium templates", included: true },
//         { text: "Export to PDF", included: true },
//       ],
//       cta: { label: "Start Free Trial", href: "/trial" },
//       popular: true,
//       badge: "Most Popular",
//     },
//   ]}
// />
