"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  testimonials: Testimonial[];
  variant?: "grid" | "carousel" | "featured";
}

export function TestimonialsSection({
  eyebrow,
  title,
  description,
  testimonials,
  variant = "grid",
}: TestimonialsSectionProps) {
  if (variant === "featured" && testimonials.length > 0) {
    const featured = testimonials[0];
    return (
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {eyebrow && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#F97316]/10 text-[#F97316] text-sm font-semibold mb-4">
                {eyebrow}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              {title}
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
              <Quote className="absolute top-8 left-8 w-12 h-12 text-[#0D9488]/20" />
              
              <div className="relative z-10 text-center">
                <p className="text-xl lg:text-2xl text-slate-700 leading-relaxed mb-8 italic">
                  "{featured.quote}"
                </p>
                
                <div className="flex items-center justify-center gap-4">
                  {featured.avatar ? (
                    <Image
                      src={featured.avatar}
                      alt={featured.author}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0D9488] to-[#F97316] flex items-center justify-center text-white text-xl font-bold">
                      {featured.author.charAt(0)}
                    </div>
                  )}
                  
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 text-lg">
                      {featured.author}
                    </div>
                    <div className="text-slate-500">
                      {featured.role} at {featured.company}
                    </div>
                  </div>
                </div>

                {featured.rating && (
                  <div className="flex items-center justify-center gap-1 mt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < featured.rating!
                            ? "fill-[#F97316] text-[#F97316]"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {eyebrow && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#F97316]/10 text-[#F97316] text-sm font-semibold mb-4">
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Rating */}
              {testimonial.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating!
                          ? "fill-[#F97316] text-[#F97316]"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Quote */}
              <p className="text-slate-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D9488] to-[#F97316] flex items-center justify-center text-white font-semibold">
                    {testimonial.author.charAt(0)}
                  </div>
                )}
                
                <div>
                  <div className="font-semibold text-slate-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Usage Example:
// <TestimonialsSection
//   eyebrow="Testimonials"
//   title="Loved by Teams Everywhere"
//   testimonials={[
//     {
//       quote: "This tool transformed our presentation workflow...",
//       author: "Sarah Chen",
//       role: "Design Lead",
//       company: "TechCorp",
//       rating: 5,
//     },
//   ]}
// />
