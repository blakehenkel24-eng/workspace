"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Image,
  Layout,
  Settings,
  ChevronRight,
  Plus,
  Download,
  Share2,
  Undo,
  Redo,
  MoreHorizontal,
  Search,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Keyboard,
  Moon,
  Zap,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  Check,
  Copy,
  Trash2,
  Clock,
  Folder,
  Star,
  MessageSquare,
  X,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Wand2,
  Palette,
  Grid,
  List,
  Filter,
  SortAsc,
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
  content?: string;
  chartType?: "bar" | "line" | "pie";
  layout: "full" | "split" | "center";
}

interface Project {
  id: string;
  name: string;
  lastEdited: string;
  thumbnail?: string;
  slides: number;
}

// Sidebar Component
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
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
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
            "w-full flex items-center gap-3 px-3 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all",
            isCollapsed && "justify-center px-2"
          )}
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
          <>
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
                            ? "bg-teal-50 border border-teal-100"
                            : "hover:bg-neutral-50 border border-transparent"
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center flex-shrink-0">
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
                        <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <template.icon className="w-5 h-5 text-teal-600" />
                        </div>
                        <p className="text-xs font-medium text-neutral-700">{template.name}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>

          {/* Collapsed State Icons */}
          <AnimatePresence>
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-2 space-y-1"
              >
                {projects.slice(0, 4).map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setActiveProject(project.id)}
                    className={cn(
                      "w-full p-2 rounded-lg transition-all flex justify-center",
                      activeProject === project.id
                        ? "bg-teal-50"
                        : "hover:bg-neutral-50"
                    )}
                    title={project.name}
                  >
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-neutral-500" />
                    </div>
                  </button>
                ))}
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

// Top Bar Component
function TopBar({ isSidebarCollapsed }: { isSidebarCollapsed: boolean }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white border-b border-neutral-200 z-30 flex items-center justify-between px-4 lg:px-6 transition-all duration-300",
        isSidebarCollapsed ? "left-[72px]" : "left-[280px]"
      )}
    >
      {/* Breadcrumb / Title */}
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
              className="w-64 pl-9 pr-4 py-2 bg-neutral-100 border-0 rounded-lg text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
              ⌘K
            </span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-neutral-100 rounded-lg">
          <Bell className="w-5 h-5 text-neutral-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-500 rounded-full" />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
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
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-coral-600 hover:bg-coral-50">
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

// Generation Form Component
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
    <div className="h-full flex flex-col">
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
        <<div className="relative">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            What do you want to create?
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your presentation topic, key points, target audience, and any specific requirements..."
            className="w-full h-40 p-4 bg-white border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600">
              <Wand2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-neutral-400">{input.length}/2000</span>
          </div>
        </div>

        {/* Quick Suggestions */}
        <<div>
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
        <<div>
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
                    ? "bg-teal-50 border-teal-200"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    selectedTemplate === template.id
                      ? "border-teal-500 bg-teal-500"
                      : "border-neutral-300"
                  )}
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
                        ? "text-teal-900"
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
        <<div>
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
                    ? "bg-teal-50 border-teal-200"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                )}
              >
                <p
                  className={cn(
                    "font-medium text-sm",
                    selectedTone === tone.id ? "text-teal-900" : "text-neutral-900"
                  )}
                >
                  {tone.name}
                </p>
                <p className="text-xs text-neutral-500">{tone.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Slide Count */}
        <<div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Target Slide Count: {slideCount} slides
          </label>
          <input
            type="range"
            min={3}
            max={30}
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>3 slides</span>
            <span>30 slides</span>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="pt-4 border-t border-neutral-200">
          <button className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
            <Settings className="w-4 h-4" />
            Advanced options
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <<div className="p-6 border-t border-neutral-200">
        <button
          onClick={onGenerate}
          disabled={!input.trim() || isGenerating}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all",
            !input.trim() || isGenerating
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30"
          )}
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

// Slide Preview Component
function SlidePreview({ slides }: { slides: Slide[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const activeSlide = slides[currentSlide] || {
    id: "empty",
    type: "title",
    title: "Your presentation will appear here",
    layout: "center",
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
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">
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
        <<div className="w-48 bg-white border-r border-neutral-200 overflow-y-auto hidden lg:block">
          <div className="p-3 space-y-2">
            {(slides.length > 0 ? slides : [{ id: "empty", type: "empty", title: "", layout: "center" }]).map(
              (slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={cn(
                    "w-full aspect-video rounded-lg border-2 overflow-hidden transition-all",
                    currentSlide === index
                      ? "border-teal-500 shadow-sm"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <div className="w-full h-full bg-white p-2">
                    <div className="w-full h-1 bg-neutral-200 rounded mb-1" />
                    <div className="w-3/4 h-0.5 bg-neutral-100 rounded mb-0.5" />
                    <div className="w-1/2 h-0.5 bg-neutral-100 rounded" />
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* Slide Canvas */}
        <<div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <{slides.length === 0 ? EmptyState : ActiveSlide}
            slide={activeSlide}
            zoom={zoom}
          />
        </div>

        {/* Right Panel - Properties */}
        <<div className="w-64 bg-white border-l border-neutral-200 hidden xl:block">
          <SlideProperties slide={activeSlide} />
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center max-w-md"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-50 to-coral-50 flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-teal-600" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        Ready to create
      </h3>
      <p className="text-neutral-600 mb-6">
        Describe your presentation on the left, and we&apos;ll generate a complete, professional deck in seconds.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {["Executive Summary", "Market Analysis", "Financial Model"].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

// Active Slide Component
function ActiveSlide({ slide, zoom }: { slide: Slide; zoom: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white shadow-2xl rounded-lg overflow-hidden"
      style={{
        width: `${960 * (zoom / 100)}px`,
        height: `${540 * (zoom / 100)}px`,
      }}
    >
      <div className="w-full h-full p-12 flex flex-col">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-neutral-900 mb-6">
            {slide.title}
          </h1>
          {slide.content && (
            <p className="text-lg text-neutral-600 leading-relaxed">{slide.content}</p>
          )}
          {slide.type === "chart" && (
            <div className="mt-8 flex items-end justify-around h-48 gap-4">
              {[40, 65, 45, 80, 60, 90].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-teal-500 to-teal-400"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>Confidential</span>
          <span>SlideTheory AI</span>
        </div>
      </div>
    </motion.div>
  );
}

// Slide Properties Panel
function SlideProperties({ slide }: { slide: Slide }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">Properties</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Layout */}
        <<div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["Full", "Split", "Center"].map((layout) => (
              <button
                key={layout}
                className="p-2 border border-neutral-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all"
              >
                <div className="aspect-video bg-neutral-100 rounded mb-1" />
                <span className="text-xs text-neutral-600">{layout}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <<div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Background
          </label>
          <div className="flex gap-2">
            {["#ffffff", "#fafaf9", "#f0fdfa", "#fff1f2"].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-lg border border-neutral-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Typography */}
        <<div>
          <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Typography
          </label>
          <div className="space-y-2">
            <select className="w-full p-2 bg-white border border-neutral-200 rounded-lg text-sm">
              <option>Inter</option>
              <option>Georgia</option>
              <option>Helvetica</option>
            </select>
          </div>
        </div>

        {/* AI Enhancement */}
        <<div className="p-4 bg-gradient-to-br from-teal-50 to-coral-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-teal-600" />
            <span className="font-medium text-sm text-neutral-900">AI Enhancements</span>
          </div>
          <div className="space-y-2">
            {["Improve clarity", "Add visuals", "Shorten text"].map((action) => (
              <button
                key={action}
                className="w-full text-left p-2 bg-white rounded-lg text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState({ progress }: { progress: number }) {
  const steps = [
    "Analyzing your request...",
    "Researching relevant frameworks...",
    "Generating slide structure...",
    "Writing content with AI...",
    "Creating data visualizations...",
    "Applying consulting best practices...",
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
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div className="absolute inset-0 rounded-2xl bg-teal-500 blur-xl opacity-30 animate-pulse" />
          </div>
        </div>

        {/* Progress */}
        <<div className="mb-6">
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
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
        <<div className="text-center">
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
            This usually takes 30-60 seconds
          </p>
        </div>

        {/* Tips */}
        <<div className="mt-8 p-4 bg-neutral-50 rounded-xl">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
            Pro Tip
          </p>
          <p className="text-sm text-neutral-600">
            You can refine any slide after generation. Click on a slide to edit its content, 
            or use AI commands like &ldquo;Make this more concise&rdquo; or &ldquo;Add a chart here&rdquo;.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main App Interface
export default function AppInterface() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSlides, setGeneratedSlides] = useState<Slide[]>([]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          // Mock generated slides
          setGeneratedSlides([
            { id: "1", type: "title", title: "Market Entry Strategy", layout: "center" },
            { id: "2", type: "content", title: "Executive Summary", content: "Key findings and recommendations...", layout: "full" },
            { id: "3", type: "chart", title: "Market Size Analysis", chartType: "bar", layout: "split" },
          ]);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300",
          isSidebarCollapsed ? "ml-[72px]" : "ml-[280px]"
        )}
      >
        <TopBar isSidebarCollapsed={isSidebarCollapsed} />

        <div className="flex-1 mt-16 flex overflow-hidden"
        >
          {/* Left Panel - Generation Form */}
          
          {!isGenerating && generatedSlides.length === 0 && (
            <div className="w-[420px] bg-white border-r border-neutral-200 flex-shrink-0"
            >
              <GenerationForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>
          )}

          {/* Center - Preview / Loading */}
          
          <div className="flex-1"
          >
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

// Menu icon component (missing import)
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
