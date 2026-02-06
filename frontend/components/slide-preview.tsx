"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Download,
  RotateCcw,
  FileImage,
  FileText,
  FileType,
  Eye,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { SlideData } from "../lib/types";

interface SlidePreviewProps {
  slide: SlideData | null;
  isLoading: boolean;
  onRegenerate: () => void;
}

export function SlidePreview({ slide, isLoading, onRegenerate }: SlidePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const slideRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = async () => {
    if (!slideRef.current || !slide) return;

    try {
      const canvas = await html2canvas(slideRef.current, {
        scale: 2,
        backgroundColor: null,
      });
      
      const link = document.createElement("a");
      link.download = `slidetheory-${slide.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to export PNG:", error);
    }
  };

  const handleExportPDF = async () => {
    if (!slideRef.current || !slide) return;

    try {
      const canvas = await html2canvas(slideRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`slidetheory-${slide.id}.pdf`);
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  const handleExportPPTX = () => {
    // Note: PPTX export requires a server-side implementation
    // This is a placeholder that would trigger an API call
    alert("PPTX export coming soon! Use PNG or PDF for now.");
  };

  if (!slide && !isLoading) {
    return (
      <Card className="h-full border-slate-800 bg-slate-900/50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <Eye className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Preview Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Fill out the form and click &quot;Generate Slide&quot; to create your MBB-quality slide.
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full border-slate-800 bg-slate-900/50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">Generating Slide...</h3>
          <div className="space-y-2 mt-4">
            <div className="h-2 bg-slate-800 rounded animate-pulse w-48 mx-auto" />
            <div className="h-2 bg-slate-800 rounded animate-pulse w-32 mx-auto" />
            <div className="h-2 bg-slate-800 rounded animate-pulse w-40 mx-auto" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full border-slate-800 bg-slate-900/50 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-400 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Regenerate
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem
                onClick={handleExportPNG}
                className="text-slate-100 focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
              >
                <FileImage className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportPDF}
                className="text-slate-100 focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportPPTX}
                className="text-slate-100 focus:bg-slate-700 focus:text-slate-100 cursor-pointer"
              >
                <FileType className="h-4 w-4 mr-2" />
                Export as PPTX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Slide Preview */}
      <CardContent className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/50">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          className="transition-transform duration-200"
        >
          <div
            ref={slideRef}
            className="slide-preview-container w-[800px] bg-white rounded-sm shadow-2xl overflow-hidden"
            style={{ aspectRatio: "16/9" }}
          >
            {slide?.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt="Generated slide"
                className="w-full h-full object-contain"
              />
            ) : slide?.htmlContent ? (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: slide.htmlContent }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-slate-800">
                {/* Default Slide Template */}
                <div className="w-full border-b-2 border-slate-800 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-slate-900">{slide?.slideType}</h1>
                </div>
                <div className="w-full flex-1 space-y-4">
                  <div className="bg-slate-100 p-4 rounded">
                    <p className="font-semibold text-slate-700 mb-2">Key Takeaway:</p>
                    <p className="text-lg text-slate-900">{slide?.keyTakeaway}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-500 mb-1">Target Audience</p>
                      <p className="text-slate-900">{slide?.audience}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-500 mb-1">Presentation Mode</p>
                      <p className="text-slate-900 capitalize">{slide?.presentationMode}</p>
                    </div>
                  </div>
                  {slide?.dataInput && (
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-500 mb-1">Data &amp; Metrics</p>
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{slide.dataInput}</pre>
                    </div>
                  )}
                </div>
                <div className="w-full mt-6 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-400 text-center">
                    Generated by SlideTheory • {new Date(slide?.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
