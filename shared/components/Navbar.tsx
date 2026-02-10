"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: string;
  links: NavLink[];
  cta?: {
    label: string;
    href: string;
  };
  variant?: "default" | "transparent" | "dark";
}

export function Navbar({
  logo = "SlideTheory",
  links,
  cta = { label: "Get Started", href: "/signup" },
  variant = "default",
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const variants = {
    default: "bg-white border-b border-slate-200",
    transparent: "bg-transparent",
    dark: "bg-slate-900",
  };

  const textColors = {
    default: "text-slate-900",
    transparent: "text-slate-900",
    dark: "text-white",
  };

  return (
    <nav className={`sticky top-0 z-50 ${variants[variant]}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#F97316] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className={`text-xl font-bold ${textColors[variant]}`}>
              {logo}
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-[#0D9488] transition-colors ${
                  variant === "dark" ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Button
              className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
              asChild
            >
              <a href={cta.href}>{cta.label}</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 ${textColors[variant]}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-slate-600 hover:text-[#0D9488] font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="w-full bg-[#0D9488] hover:bg-[#0D9488]/90 text-white mt-4"
                asChild
              >
                <a href={cta.href}>{cta.label}</a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// Usage Example:
// <Navbar
//   links={[
//     { label: "Features", href: "#features" },
//     { label: "Pricing", href: "#pricing" },
//     { label: "About", href: "#about" },
//   ]}
//   cta={{ label: "Get Started", href: "/signup" }}
// />
