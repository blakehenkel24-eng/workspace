"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  BarChart3,
  TrendingUp,
  Layout,
  ChevronRight,
  Plus,
  Download,
  Share2,
  Undo,
  Redo,
  Search,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Keyboard,
  Moon,
  Wand2,
  Settings,
  ChevronDown,
  Check,
  Copy,
  Trash2,
  Clock,
  Folder,
  Star,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Lightbulb,
  TrendingUp as TrendIcon,
  Target,
  Users,
  Zap,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface Slide {
  id: string;
  type: "title" | "content" | "chart" | "image" | "split";
  title: string;
  subtitle?: string;
  insight?: string;
  content?: string[];
  chartData?: Array<{ label: string; value: number; color: "yellow" | "orange" | "coral" }>;
  layout: "full" | "split" | "center";
}

interface Project {
  id: string;
  name: string;
  lastEdited: string;
  thumbnail?: string;
  slides: number;
}

// ============================================
// MBB DESIGN SYSTEM - EXACT SPECIFICATIONS
// ============================================

const MBB_COLORS = {
  // Warm Orange System
  coral: "#E85A2C",
  burntOrange: "#D35400",
  terracotta: "#8B4513",
  orange300: "#fdba74",
  orange500: "#f97316",
  orange600: "#ea580c",
  
  // Dark Teal/Blue-Gray (Key Insights Panel)
  insightDark: "#2C3E50",
  insightDarker: "#1a252f",
  
  // Chart Colors
  chartYellow: "#FFD93D",
  chartOrange: "#E74C3C",
  chartCoral: "#E85A2C",
  
  // Neutrals
  white: "#ffffff",
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray400: "#9CA3AF",
  gray600: "#4B5563",
  gray900: "#111827",
};

// ============================================
// SLIDE COMPONENTS - MBB QUALITY
// ============================================

// Key Insights Panel (The Hero Component)
function KeyInsightsPanel({ 
  children, 
  label = "KEY INSIGHTS",
  icon: Icon = Lightbulb 
}: { 
  children: React.ReactNode; 
  label?: string;
  icon?: React.ElementType;
}) {
  return (
    <div 
      className="rounded-xl p-6 mb-6"
      style={{
        background: MBB_COLORS.insightDark,
        boxShadow: "0 4px 20px rgba(44, 62, 80, 0.3)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color: MBB_COLORS.orange300 }} />
        <span 
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: MBB_COLORS.orange300 }}
        >
          {label}
        </span>
      </div>
      <p className="text-lg font-medium text-white leading-relaxed">
        {children}
      </p>
    </div>
  );
}

// Glassmorphism Card
function GlassCard({ 
  children, 
  className,
  title,
  icon: Icon 
}: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  icon?: React.ElementType;
}) {
  return (
    <div 
      className={cn("rounded-xl overflow-hidden", className)}
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
      }}
    >
      {title && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

// MBB-Style Bullet Points
function MBBBullet({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "arrow" | "check" }) {
  const icons = {
    default: (
      <div 
        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
        style={{ background: MBB_COLORS.orange500 }}
      />
    ),
    arrow: (
      <TrendIcon 
        className="w-4 h-4 mt-1 flex-shrink-0" 
        style={{ color: MBB_COLORS.coral }}
      />
    ),
    check: (
      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
        <Check className="w-3 h-3 text-green-500" />
      </div>
    ),
  };

  return (
    <div className="flex items-start gap-3 py-2">
      {icons[variant]}
      <span className="text-sm text-gray-600 leading-relaxed">{children}</span>
    </div>
  );
}

// Gradient Bar Chart (MBB Style)
function MBBBarChart({ 
  data,
  showLabels = true,
  height = 200 
}: { 
  data: Array<{ label: string; value: number; color: "yellow" | "orange" | "coral" }>;
  showLabels?: boolean;
  height?: number;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  const gradients = {
    yellow: "linear-gradient(180deg, #FFD93D 0%, #F4D03F 100%)",
    orange: "linear-gradient(180deg, #E74C3C 0%, #C0392B 100%)",
    coral: "linear-gradient(180deg, #E85A2C 0%, #D35400 100%)",
  };

  const glows = {
    yellow: "0 4px 20px rgba(255, 217, 61, 0.3)",
    orange: "0 4px 20px rgba(231, 76, 60, 0.3)",
    coral: "0 4px 20px rgba(232, 90, 44, 0.3)",
  };

  return (
    <div className="flex items-end justify-between gap-4" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          {showLabels && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-xs font-bold text-gray-700 mb-2"
            >
              {item.value}
            </motion.span>
          )}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className="w-full rounded-t-lg transition-all hover:brightness-110"
            style={{
              background: gradients[item.color],
              boxShadow: glows[item.color],
              minHeight: 4,
            }}
          />
          <span className="text-xs text-gray-500 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Data Callout Badge
function DataCallout({ value, label, trend = "up" }: { value: string; label?: string; trend?: "up" | "down" | "neutral" }) {
  const colors = {
    up: { bg: "bg-orange-100", text: "text-orange-700" },
    down: { bg: "bg-red-100", text: "text-red-700" },
    neutral: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const icons = {
    up: "↑",
    down: "↓",
    neutral: "→",
  };

  return (
    <div className={`inline-flex flex-col items-center px-3 py-2 rounded-lg ${colors[trend].bg}`}>
      <span className={`text-sm font-bold ${colors[trend].text}`}>
        {icons[trend]} {value}
      </span>
      {label && <span className="text-xs opacity-75 text-gray-600">{label}</span>}
    </div>
  );
}

// ============================================
// MBB QUALITY SLIDE RENDERER
// ============================================

function MBBSlide({ slide }: { slide: Slide }) {
  return (
    <div 
      className="w-full h-full p-10 flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${MBB_COLORS.burntOrange} 0%, #A0522D 50%, ${MBB_COLORS.terracotta} 100%)`,
      }}
    >
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: MBB_COLORS.coral }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-sm text-white/80">{slide.subtitle}</p>
          )}
        </div>

        {/* Key Insight Panel */}
        {slide.insight && (
          <KeyInsightsPanel>
            {slide.insight}
          </KeyInsightsPanel>
        )}

        {/* Content Grid */}
        <div className="flex-1 grid grid-cols-5 gap-6">
          {/* Left Column - Bullet Points */}
          <div className="col-span-2">
            <GlassCard title="Key Drivers" icon={Target} className="h-full">
              <div className="space-y-1">
                {slide.content?.map((point, idx) => (
                  <MBBBullet key={idx} variant={idx === 0 ? "arrow" : "default"}>
                    {point}
                  </MBBBullet>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Chart */}
          <div className="col-span-3">
            <GlassCard title="Quarterly Performance" icon={BarChart3} className="h-full">
              {slide.chartData && (
                <MBBBarChart data={slide.chartData} height={180} />
              )}
            </GlassCard>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 text-xs text-white/60 flex items-center gap-2">
          <span className="font-medium">Source:</span>
          <span>Company Financials, Q4 2024</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SIDEBAR COMPONENT
// ============================================

function Sidebar({
  isCollapsed,
  setIsCollapsed,
  activeProject,
  setActiveProject,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  activeProject: string | null;
  setActiveProject: (id: string | null) => void;
}) {
  const [activeSection, setActiveSection] = useState("projects");

  const projects: Project[] = [
    { id: "1", name: "Q4 Strategy Review", lastEdited: "2 hours ago", slides: 12 },
    { id: "2", name: "Merger Analysis", lastEdited: "Yesterday", slides: 24 },
    { id: "3", name: "Board Presentation", lastEdited: "3 days ago", slides: 18 },
    { id: "4", name: "Market Entry Study", lastEdited: "1 week ago", slides: 32 },
  ];

  const templates = [
    { id: "1", name: "Executive Summary", icon: FileText },
    { id: "2", name: "Market Analysis", icon: BarChart3 },
    { id: "3", name: "Financial Model", icon: TrendingUp },
    { id: "4", name: "Project Timeline", icon: Clock },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 bg-white border-r border-neutral-200 z-40 flex flex-col"
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-100">
        <Link href="/" className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: `linear-gradient(135deg, ${MBB_COLORS.coral}, ${MBB_COLORS.burntOrange})` }}
          >
            <Layout className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-neutral-900 text-lg whitespace-nowrap"
              >
                SlideTheory
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* New Project Button */}
      <div className="p-3">
        <button
          onClick={() => setActiveProject(null)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-white rounded-lg transition-all",
            isCollapsed && "justify-center px-2"
          )}
          style={{ background: MBB_COLORS.coral }}
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold text-sm whitespace-nowrap"
              >
                New Project
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin">
          {/* Section Tabs */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 mb-2"
              >
                <div className="flex bg-neutral-100 rounded-lg p-1">
                  {["projects", "templates"].map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={cn(
                        "flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all capitalize",
                        activeSection === section
                          ? "bg-white text-neutral-900 shadow-sm"
                          : "text-neutral-500 hover:text-neutral-700"
                      )}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects List */}
          <AnimatePresence>
            {!isCollapsed && activeSection === "projects" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3"
              >
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Recent
                  </span>
                  <button className="p-1 hover:bg-neutral-100 rounded">
                    <Folder className="w-4 h-4 text-neutral-400" />
                  </button>
                </div>

                <div className="space-y-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setActiveProject(project.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                        activeProject === project.id
                          ? "border"
                          : "hover:bg-neutral-50 border border-transparent"
                      )}
                      style={activeProject === project.id ? { 
                        background: "rgba(232, 90, 44, 0.05)",
                        borderColor: "rgba(232, 90, 44, 0.2)"
                      } : {}}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #f5f5f5, #e5e5e5)" }}
                      >
                        <FileText className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-neutral-900 truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {project.slides} slides • {project.lastEdited}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Templates Grid */}
          <AnimatePresence>
            {!isCollapsed && activeSection === "templates" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      className="p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 transition-all text-center group"
                    >
                      <div 
                        className="w-10 h-10 mx-auto mb-2 rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ background: "rgba(232, 90, 44, 0.1)" }}
                      >
                        <template.icon className="w-5 h-5" style={{ color: MBB_COLORS.coral }} />
                      </div>
                      <p className="text-xs font-medium text-neutral-700">{template.name}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-neutral-100">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </motion.div>
        </button>
      </div>
    </motion.aside>
  );
}

// ============================================
// TOP BAR
// ============================================

function TopBar({ isSidebarCollapsed }: { isSidebarCollapsed: boolean }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white border-b border-neutral-200 z-30 flex items-center justify-between px-4 lg:px-6 transition-all duration-300",
        isSidebarCollapsed ? "left-[72px]" : "left-[280px]"
      )}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-neutral-100 rounded-lg lg:hidden">
          <Menu className="w-5 h-5 text-neutral-600" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <Link href="/" className="text-neutral-500 hover:text-neutral-700">
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-900 font-medium">New Project</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search slides, templates..."
              className="w-64 pl-9 pr-4 py-2 bg-neutral-100 border-0 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 rounded-md transition-all"
              style={{ focusRing: MBB_COLORS.coral }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
              ⌘K
            </span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-neutral-100 rounded-lg">
          <Bell className="w-5 h-5 text-neutral-600" />
          <span 
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: MBB_COLORS.coral }}
          />
        </button>

        {/* Help */}
        <button className="hidden sm:flex p-2 hover:bg-neutral-100 rounded-lg">
          <HelpCircle className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${MBB_COLORS.coral}, ${MBB_COLORS.burntOrange})` }}
            >
              JD
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfile(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="font-semibold text-neutral-900">John Doe</p>
                    <p className="text-sm text-neutral-500">john@consulting.com</p>
                  </div>
                  <div className="py-1">
                    {[
                      { icon: User, label: "Profile" },
                      { icon: Settings, label: "Settings" },
                      { icon: Keyboard, label: "Keyboard shortcuts" },
                      { icon: Moon, label: "Dark mode" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-neutral-100 py-1">
                    <button 
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50 transition-colors"
                      style={{ color: MBB_COLORS.coral }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// ============================================
// GENERATION FORM
// ============================================

function GenerationForm({
  onGenerate,
  isGenerating,
}: {
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const [input, setInput] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("auto");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [slideCount, setSlideCount] = useState(8);

  const templates = [
    { id: "auto", name: "Auto-detect", description: "Let AI choose the best structure" },
    { id: "executive", name: "Executive Summary", description: "High-level overview for leadership" },
    { id: "analysis", name: "Strategic Analysis", description: "Framework-driven deep dive" },
    { id: "pitch", name: "Client Pitch", description: "Persuasive, benefits-focused" },
    { id: "report", name: "Research Report", description: "Data-heavy, academic style" },
  ];

  const tones = [
    { id: "professional", name: "Professional", description: "Formal consulting tone" },
    { id: "executive", name: "Executive", description: "Concise, action-oriented" },
    { id: "conversational", name: "Conversational", description: "Approachable, clear" },
    { id: "technical", name: "Technical", description: "Detailed, precise" },
  ];

  const suggestions = [
    "Create a market entry analysis for a fintech startup entering Southeast Asia",
    "Build an executive summary for a $50M Series B fundraising deck",
    "Generate a competitive analysis comparing 5 major cloud providers",
    "Draft a board presentation on Q4 performance and 2024 strategy",
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">Create New Deck</h2>
        <p className="text-sm text-neutral-500">
          Describe what you need, and we&apos;ll generate a complete presentation
        </p>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Input Area */}
        <div className="relative">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            What do you want to create?
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your presentation topic, key points, target audience, and any specific requirements..."
            className="w-full h-40 p-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 transition-all"
            style={{ focusRing: `rgba(232, 90, 44, 0.2)` }}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600">
              <Wand2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-neutral-400">{input.length}/2000</span>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Try an example
          </p>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="w-full text-left p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Template Style
          </label>
          <div className="grid grid-cols-1 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  selectedTemplate === template.id
                    ? "border-2"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                )}
                style={selectedTemplate === template.id ? {
                  background: "rgba(232, 90, 44, 0.05)",
                  borderColor: MBB_COLORS.coral,
                } : {}}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    selectedTemplate === template.id
                      ? "border-white"
                      : "border-neutral-300"
                  )}
                  style={selectedTemplate === template.id ? {
                    background: MBB_COLORS.coral,
                  } : {}}
                >
                  {selectedTemplate === template.id && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      selectedTemplate === template.id
                        ? "text-neutral-900"
                        : "text-neutral-900"
                    )}
                  >
                    {template.name}
                  </p>
                  <p className="text-xs text-neutral-500">{template.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Writing Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  selectedTone === tone.id
                    ? "border-2"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                )}
                style={selectedTone === tone.id ? {
                  background: "rgba(232, 90, 44, 0.05)",
                  borderColor: MBB_COLORS.coral,
                } : {}}
              >
                <p className={"font-medium text-sm text-neutral-900"}>
                  {tone.name}
                </p>
                <p className="text-xs text-neutral-500">{tone.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Slide Count */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Target Slide Count: <span style={{ color: MBB_COLORS.coral }}>{slideCount}</span> slides
          </label>
          <input
            type="range"
            min={3}
            max={30}
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: MBB_COLORS.coral }}
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>3 slides</span>
            <span>30 slides</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-200">
        <button
          onClick={onGenerate}
          disabled={!input.trim() || isGenerating}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all",
            !input.trim() || isGenerating
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "text-white shadow-lg hover:shadow-xl"
          )}
          style={!input.trim() || isGenerating ? {} : {
            background: `linear-gradient(135deg, ${MBB_COLORS.coral}, ${MBB_COLORS.burntOrange})`,
            boxShadow: "0 10px 30px rgba(232, 90, 44, 0.3)",
          }}
        >
          {isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Generating your deck...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Presentation
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================
// SLIDE PREVIEW WITH MBB QUALITY
// ============================================

function SlidePreview({ slides }: { slides: Slide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const activeSlide = slides[currentSlide] || {
    id: "empty",
    type: "title",
    title: "Revenue Growth Accelerated by New Markets",
    subtitle: "Q1 to Q4 revenue breakdown highlights market strategy success",
    insight: "New market entry drives significant revenue increase",
    content: [
      "Q2 growth of 50% exceeded targets by 20pts, validating expansion strategy",
      "New markets contributed 40% to growth, highlighting successful entry strategy",
      "Existing markets slowed to 5% growth, indicating saturation and need for innovation",
      "Customer acquisition cost decreased to $350, improving profitability margins",
    ],
    chartData: [
      { label: "Q1", value: 10, color: "orange" },
      { label: "Q2", value: 15, color: "yellow" },
      { label: "Q3", value: 18, color: "orange" },
      { label: "Q4", value: 20, color: "coral" },
    ],
    layout: "split",
  };

  return (
    <div className="h-full flex flex-col bg-neutral-100">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4">
        {/* Left: Slide Info */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500">
            Slide {currentSlide + 1} of {slides.length || 1}
          </span>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-neutral-100 rounded">
              <Undo className="w-4 h-4 text-neutral-600" />
            </button>
            <button className="p-1.5 hover:bg-neutral-100 rounded">
              <Redo className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Center: View Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600"
          >
            -
          </button>
          <span className="text-sm text-neutral-600 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600"
          >
            +
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-lg"
            style={{ background: MBB_COLORS.coral }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-neutral-100 rounded text-neutral-600"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Slide Navigator */}
        <div className="w-48 bg-white border-r border-neutral-200 overflow-y-auto hidden lg:block">
          <div className="p-3 space-y-2">
            {(slides.length > 0 ? slides : [activeSlide]).map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-full aspect-video rounded-lg border-2 overflow-hidden transition-all",
                  currentSlide === index
                    ? "shadow-sm"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
                style={currentSlide === index ? { borderColor: MBB_COLORS.coral } : {}}
              >
                <div 
                  className="w-full h-full p-2"
                  style={{
                    background: `linear-gradient(135deg, ${MBB_COLORS.burntOrange}, ${MBB_COLORS.terracotta})`,
                  }}
                >
                  <div className="w-full h-1 bg-white/30 rounded mb-1" />
                  <div className="w-3/4 h-0.5 bg-white/20 rounded mb-0.5" />
                  <div className="w-1/2 h-0.5 bg-white/20 rounded" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-neutral-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg overflow-hidden shadow-2xl"
            style={{
              width: `${960 * (zoom / 100)}px`,
              height: `${540 * (zoom / 100)}px`,
            }}
          >
            {slides.length === 0 ? (
              <MBBSlide slide={activeSlide} />
            ) : (
              <MBBSlide slide={activeSlide} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOADING STATE
// ============================================

function LoadingState({ progress }: { progress: number }) {
  const steps = [
    "Analyzing your request...",
    "Researching MBB frameworks...",
    "Generating slide structure...",
    "Writing executive content...",
    "Creating data visualizations...",
    "Applying premium styling...",
    "Finalizing your presentation...",
  ];

  const currentStep = Math.floor((progress / 100) * steps.length);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Animated Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${MBB_COLORS.coral}, ${MBB_COLORS.burntOrange})`,
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div 
              className="absolute inset-0 rounded-2xl blur-xl opacity-30 animate-pulse"
              style={{ background: MBB_COLORS.coral }}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${MBB_COLORS.coral}, ${MBB_COLORS.burntOrange})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-neutral-900">
              {Math.round(progress)}%
            </span>
            <span className="text-sm text-neutral-500">
              ~{Math.ceil((100 - progress) / 10)}s remaining
            </span>
          </div>
        </div>

        {/* Current Step */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-medium text-neutral-900"
            >
              {steps[Math.min(currentStep, steps.length - 1)]}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-neutral-500 mt-2">
            Creating McKinsey-quality slides
          </p>
        </div>
      </div>
    </div>
  );
}

// Menu icon component
function Menu({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function SlideTheoryApp() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSlides, setGeneratedSlides] = useState<Slide[]>([]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedSlides([
            { 
              id: "1", 
              type: "title", 
              title: "Revenue Growth Accelerated by New Markets",
              subtitle: "Q1 to Q4 revenue breakdown highlights market strategy success",
              insight: "New market entry drives significant revenue increase",
              content: [
                "Q2 growth of 50% exceeded targets by 20pts",
                "New markets contributed 40% to overall growth",
                "Existing markets showed only 5% growth, indicating saturation",
                "Customer acquisition cost decreased to $350, improving margins",
              ],
              chartData: [
                { label: "Q1", value: 10, color: "orange" },
                { label: "Q2", value: 15, color: "yellow" },
                { label: "Q3", value: 18, color: "orange" },
                { label: "Q4", value: 20, color: "coral" },
              ],
              layout: "split" 
            },
          ]);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="h-screen bg-white">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
      />

      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300",
          isSidebarCollapsed ? "ml-[72px]" : "ml-[280px]"
        )}
      >
        <TopBar isSidebarCollapsed={isSidebarCollapsed} />

        <div className="flex-1 mt-16 flex overflow-hidden">
          {!isGenerating && generatedSlides.length === 0 && (
            <div className="w-[420px] bg-white border-r border-neutral-200 flex-shrink-0">
              <GenerationForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>
          )}

          <div className="flex-1">
            {isGenerating ? (
              <LoadingState progress={generationProgress} />
            ) : (
              <SlidePreview slides={generatedSlides} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
