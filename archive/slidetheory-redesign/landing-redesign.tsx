"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  FileText,
  BarChart3,
  Layers,
  Share2,
  Check,
  ArrowRight,
  Star,
  Quote,
  Play,
  ChevronRight,
  Menu,
  X,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(at 40% 20%, hsla(168, 76%, 42%, 0.15) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(348, 88%, 60%, 0.1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(168, 76%, 42%, 0.1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(348, 88%, 60%, 0.08) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(168, 76%, 42%, 0.12) 0px, transparent 50%)
          `,
        }}
      />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{
          background: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
          top: "10%",
          left: "10%",
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
        style={{
          background: "linear-gradient(135deg, #f43f5e, #fb7185)",
          bottom: "20%",
          right: "5%",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Templates", href: "#templates" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-600/20 group-hover:shadow-teal-600/30 transition-shadow">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-teal-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xl font-bold text-neutral-900 tracking-tight">
                SlideTheory
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100/80 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/app"
                className="group px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                Get started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 lg:hidden bg-white/95 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 text-center text-base font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/app"
                  className="block w-full px-4 py-3 text-center text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hero Component
function Hero() {
  const words = ["strategy decks", "board presentations", "client proposals", "investment memos"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200/50 rounded-full text-sm font-medium text-teal-700 hover:bg-teal-100/50 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Now with AI-powered narrative generation</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-neutral-900 tracking-tight leading-[1.1] mb-6"
            >
              Create consulting-grade{" "}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentWord}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500"
                  >
                    {words[currentWord]}
                  </motion.span>
                </AnimatePresence>
              </span>{" "}
              in minutes
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg lg:text-xl text-neutral-600 leading-relaxed mb-8 max-w-xl"
            >
              SlideTheory combines the rigor of top-tier consulting with the speed of AI. 
              Transform your ideas into executive-ready presentations that win deals.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/app"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all"
              >
                Start creating free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Play className="w-4 h-4 text-teal-600 ml-0.5" />
                </div>
                Watch demo
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-xs font-medium text-neutral-600"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-neutral-900">4.9</span>
                </div>
                <p className="text-sm text-neutral-500">
                  Trusted by 2,000+ consultants at McKinsey, BCG, Bain, and more
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Interactive Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-neutral-900/10 border border-neutral-200/60 bg-white">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-200/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md text-xs text-neutral-400 border border-neutral-200">
                    slidetheory.app
                  </div>
                </div>
              </div>

              {/* App Preview */}
              <div className="p-6 bg-neutral-50/50">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-neutral-700">Q4 Strategy Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-white rounded-md text-xs font-medium text-neutral-600 border border-neutral-200">
                      Share
                    </div>
                    <div className="px-3 py-1.5 bg-teal-600 rounded-md text-xs font-medium text-white">
                      Export
                    </div>
                  </div>
                </div>

                {/* Slide Preview */}
                <div className="aspect-video bg-white rounded-xl shadow-sm border border-neutral-200 p-6 relative overflow-hidden">
                  {/* Slide Content */}
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-32 h-4 bg-neutral-100 rounded" />
                      <div className="w-16 h-4 bg-teal-100 rounded" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="w-full h-3 bg-neutral-100 rounded" />
                        <div className="w-3/4 h-3 bg-neutral-100 rounded" />
                        <div className="w-5/6 h-3 bg-neutral-100 rounded" />
                        <div className="pt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                              <div className="w-16 h-3 bg-neutral-100 rounded mb-1" />
                              <div className="w-24 h-2 bg-neutral-50 rounded" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-teal-50 to-coral-50 rounded-lg p-4">
                        <div className="flex items-end justify-around h-full">
                          {[40, 65, 45, 80, 60, 90].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                              className="w-8 rounded-t bg-gradient-to-t from-teal-500 to-teal-400"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating AI Indicator */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg border border-neutral-100"
                  >
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs font-medium text-neutral-700">AI Enhancing</span>
                  </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Check className="w-4 h-4 text-teal-600" />
                      Grammar checked
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Check className="w-4 h-4 text-teal-600" />
                      Charts optimized
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400">Slide 3 of 12</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 px-4 py-2 bg-white rounded-xl shadow-xl border border-neutral-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-coral-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-coral-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">5x faster</p>
                  <p className="text-[10px] text-neutral-500">than manual creation</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 px-4 py-2 bg-white rounded-xl shadow-xl border border-neutral-100"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">Enterprise ready</p>
                  <p className="text-[10px] text-neutral-500">SOC 2 compliant</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Logo Cloud Component
function LogoCloud() {
  const logos = [
    "McKinsey & Company",
    "Boston Consulting Group",
    "Bain & Company",
    "Deloitte",
    "KPMG",
    "PwC",
  ];

  return (
    <section className="py-16 border-y border-neutral-200/60 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-neutral-500 uppercase tracking-wider mb-8">
          Trusted by consultants at the world&apos;s top firms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-lg font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Component
function Features() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Transform bullet points into compelling narratives. Our AI understands consulting frameworks and crafts executive-ready content.",
      color: "teal",
    },
    {
      icon: BarChart3,
      title: "Smart Data Visualization",
      description: "Upload your data and watch as SlideTheory automatically generates the optimal chart type with professional styling.",
      color: "coral",
    },
    {
      icon: Layers,
      title: "Consulting Templates",
      description: "Access battle-tested frameworks: MECE issue trees, 2x2 matrices, waterfall charts, and more—ready to customize.",
      color: "teal",
    },
    {
      icon: Share2,
      title: "Seamless Collaboration",
      description: "Share with your team in real-time. Comments, version history, and approval workflows built for consulting teams.",
      color: "coral",
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Generate complete presentations in minutes, not hours. Spend your time on insights, not formatting.",
      color: "teal",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 Type II certified, GDPR compliant, and SSO ready. Your client data never leaves secure infrastructure.",
      color: "coral",
    },
  ];

  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16 lg:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-6">
            Features
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            Everything you need to create{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-500">
              winning presentations
            </span>
          </h2>
          <p className="text-lg text-neutral-600">
            From first draft to final delivery, SlideTheory streamlines every step of the presentation creation process.
          </p>
        </motion.div>

        {/* Features Grid - Asymmetric Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "group relative p-6 lg:p-8 rounded-2xl border transition-all duration-300",
                i === 0 || i === 3
                  ? "lg:col-span-2 bg-gradient-to-br from-teal-50/50 to-white border-teal-100 hover:border-teal-200"
                  : "bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-lg"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110",
                feature.color === "teal" ? "bg-teal-100" : "bg-coral-100"
              )}>
                <feature.icon className={cn(
                  "w-6 h-6",
                  feature.color === "teal" ? "text-teal-600" : "text-coral-600"
                )} />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover Link */}
              <div className="mt-5 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={feature.color === "teal" ? "text-teal-600" : "text-coral-600"}>
                  Learn more
                </span>
                <ArrowRight className={cn(
                  "w-4 h-4 transition-transform group-hover:translate-x-1",
                  feature.color === "teal" ? "text-teal-600" : "text-coral-600"
                )} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Component
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Input your content",
      description: "Paste your notes, upload data files, or connect to your research. SlideTheory understands unstructured input and organizes it logically.",
      image: "input",
    },
    {
      number: "02",
      title: "AI builds your narrative",
      description: "Our AI analyzes your content, identifies the story arc, and suggests the optimal slide structure using proven consulting frameworks.",
      image: "narrative",
    },
    {
      number: "03",
      title: "Refine and polish",
      description: "Review AI suggestions, make edits with natural language commands, and apply your brand colors with one click.",
      image: "refine",
    },
    {
      number: "04",
      title: "Export and present",
      description: "Download in PowerPoint, Google Slides, or PDF format. All charts remain editable and fonts render perfectly.",
      image: "export",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16 lg:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral-50 text-coral-700 text-sm font-medium mb-6">
            How it works
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
            From raw ideas to polished decks{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-600 to-coral-500">
              in four steps
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16 lg:space-y-24">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "grid lg:grid-cols-2 gap-8 lg:gap-16 items-center",
                i % 2 === 1 && "lg:grid-flow-dense"
              )}
            >
              {/* Content */}
              <div className={cn(i % 2 === 1 && "lg:col-start-2")}>
                <span className="text-6xl lg:text-8xl font-bold text-neutral-200">
                  {step.number}
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 mt-4 mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Visual */}
              <div className={cn(
                "relative rounded-2xl overflow-hidden shadow-xl",
                i % 2 === 1 && "lg:col-start-1"
              )}>
                <div className="aspect-[4/3] bg-gradient-to-br from-white to-neutral-100 p-8 flex items-center justify-center">
                  {/* Abstract step visualization */}
                  <div className="w-full max-w-sm">
                    {i === 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-neutral-200">
                          <FileText className="w-8 h-8 text-teal-600" />
                          <div className="flex-1">
                            <div className="h-2 bg-neutral-200 rounded w-3/4 mb-2" />
                            <div className="h-2 bg-neutral-100 rounded w-1/2" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-neutral-200">
                          <BarChart3 className="w-8 h-8 text-coral-500" />
                          <div className="flex-1">
                            <div className="h-2 bg-neutral-200 rounded w-2/3 mb-2" />
                            <div className="h-2 bg-neutral-100 rounded w-1/3" />
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 1 && (
                      <div className="relative">
                        <div className="flex justify-center gap-2 mb-4">
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              className="w-16 h-20 bg-white rounded-lg shadow-sm border border-neutral-200 flex flex-col items-center justify-center"
                            >
                              <div className="w-8 h-1 bg-neutral-200 rounded mb-2" />
                              <div className="w-10 h-1 bg-neutral-100 rounded mb-1" />
                              <div className="w-6 h-1 bg-neutral-100 rounded" />
                            </div>
                          ))}
                        </div>
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-full"
                        >
                          AI
                        </motion.div>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="space-y-3">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-teal-200">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                              <Check className="w-4 h-4 text-teal-600" />
                            </div>
                            <span className="text-sm font-medium text-neutral-700">Executive Summary</span>
                          </div>
                          <div className="h-2 bg-teal-50 rounded w-full" />
                        </div>
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-neutral-200 opacity-50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-neutral-100" />
                            <span className="text-sm text-neutral-500">Market Analysis</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {i === 3 && (
                      <div className="flex items-center justify-center gap-4">
                        {["PPTX", "PDF", "GSL"].map((format, idx) => (
                          <motion.div
                            key={format}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="w-20 h-24 bg-white rounded-xl shadow-lg border border-neutral-200 flex flex-col items-center justify-center"
                          >
                            <FileText className="w-8 h-8 text-neutral-400 mb-2" />
                            <span className="text-xs font-semibold text-neutral-600">{format}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
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

// Testimonials Component
function Testimonials() {
  const testimonials = [
    {
      quote: "SlideTheory cut our deck creation time by 70%. The AI actually understands consulting frameworks—it's like having a senior associate who never sleeps.",
      author: "Sarah Chen",
      role: "Engagement Manager, McKinsey & Company",
      avatar: "SC",
    },
    {
      quote: "Finally, a tool that produces partner-ready slides without the endless back-and-forth. Our team adopted it within a week.",
      author: "Michael Torres",
      role: "Principal, BCG",
      avatar: "MT",
    },
    {
      quote: "The data visualization is incredible. Upload a CSV, get presentation-ready charts in seconds. Pure magic.",
      author: "Emma Wilson",
      role: "Senior Consultant, Bain & Company",
      avatar: "EW",
    },
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-sm font-medium mb-6">
            Testimonials
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight">
            Loved by consultants at{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-coral-500">
              top-tier firms
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-6 lg:p-8 bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-lg transition-shadow"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-neutral-100" />
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{testimonial.author}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 px-6 py-16 lg:px-16 lg:py-24"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-coral-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to transform your presentation workflow?
            </h2>
            <p className="text-lg text-teal-100 mb-10 max-w-2xl mx-auto">
              Join 2,000+ consultants who have cut their deck creation time by 70%. 
              Start free—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/app"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-neutral-50 text-teal-700 font-semibold rounded-xl shadow-lg transition-all"
              >
                Get started free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded-xl border border-teal-500 transition-all"
              >
                <Users className="w-5 h-5" />
                Book a demo
              </Link>
            </div>
            <p className="mt-6 text-sm text-teal-200">
              Free forever plan available. Premium features from $29/month.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  const footerLinks = {
    Product: ["Features", "Templates", "Integrations", "Pricing", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press", "Partners"],
    Resources: ["Documentation", "Help Center", "Community", "API Reference"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
  };

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">SlideTheory</span>
            </Link>
            <p className="text-sm text-neutral-600 mb-4 max-w-xs">
              AI-powered presentation creation for strategy consultants. 
              Create consulting-grade decks in minutes.
            </p>
            <div className="flex items-center gap-4">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-neutral-900 mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} SlideTheory. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900">
              Status
            </Link>
            <Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900">
              Security
            </Link>
            <Link href="#" className="text-sm text-neutral-500 hover:text-neutral-900">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <LogoCloud />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
