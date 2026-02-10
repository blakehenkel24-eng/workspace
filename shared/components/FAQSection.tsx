"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  items: FAQItem[];
  variant?: "default" | "cards";
}

export function FAQSection({
  eyebrow,
  title,
  description,
  items,
  variant = "default",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (variant === "cards") {
    return (
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0D9488]/10 text-[#0D9488] flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {item.question}
                </h3>
                <p className="text-slate-600 leading-relaxed pl-11">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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

        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl overflow-hidden transition-all ${
                openIndex === index
                  ? "bg-white shadow-lg ring-2 ring-[#0D9488]/20"
                  : "bg-white shadow-sm hover:shadow-md"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-lg font-semibold text-slate-900 pr-4">
                  {item.question}
                </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    openIndex === index
                      ? "bg-[#0D9488] text-white rotate-180"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5">
                      <p className="text-slate-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Usage Example:
// <FAQSection
//   eyebrow="FAQ"
//   title="Frequently Asked Questions"
//   items={[
//     {
//       question: "How does the free trial work?",
//       answer: "Start with a 14-day free trial with full access...",
//     },
//   ]}
// />
