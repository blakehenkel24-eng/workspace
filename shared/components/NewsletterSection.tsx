"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface NewsletterSectionProps {
  variant?: "default" | "inline" | "card";
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
}

export function NewsletterSection({
  variant = "default",
  title = "Stay in the loop",
  description = "Get the latest updates, tips, and exclusive offers delivered to your inbox.",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  successMessage = "Thanks for subscribing! Check your inbox soon.",
}: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // Add your newsletter signup logic here
    }
  };

  if (variant === "inline") {
    return (
      <section className="py-12 bg-[#0D9488]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                {title}
              </h3>
              <p className="text-white/80 text-sm">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder={placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white border-0 text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-6 bg-[#F97316] hover:bg-[#F97316]/90 text-white"
              >
                {buttonText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "card") {
    return (
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-slate-50 rounded-3xl p-8 lg:p-12 text-center border border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-[#0D9488]/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#0D9488]" />
              </div>

              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
                {title}
              </h3>
              <p className="text-slate-600 mb-8">{description}</p>

              {submitted ? (
                <div className="flex items-center justify-center gap-2 text-[#0D9488] font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  {successMessage}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder={placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white rounded-xl font-semibold"
                  >
                    {buttonText}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4">
            Newsletter
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 mb-8">{description}</p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-[#0D9488] font-semibold py-4"
            >
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder={placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white border-slate-200"
                  required
                />
              </div>
              <Button
                type="submit"
                className="h-12 px-6 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
              >
                {buttonText}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// Usage Examples:
// <NewsletterSection variant="default" />
// <NewsletterSection variant="inline" />
// <NewsletterSection variant="card" />
