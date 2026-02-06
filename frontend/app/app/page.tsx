"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { SlideForm } from "@/components/slide-form";
import { SlidePreview } from "@/components/slide-preview";
import { AuthModal } from "@/components/auth-modal";
import { generateSlide } from "@/lib/api";
import { GenerateSlideRequest, SlideData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function AppPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<SlideData | null>(null);
  const [lastRequest, setLastRequest] = useState<GenerateSlideRequest | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (request: GenerateSlideRequest) => {
    setIsGenerating(true);
    setLastRequest(request);

    try {
      const response = await generateSlide(request);

      if (response.success && response.slide) {
        setCurrentSlide(response.slide);
        toast({
          title: "Slide Generated",
          description: "Your slide has been created successfully.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: response.error || "Failed to generate slide. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (lastRequest) {
      handleGenerate(lastRequest);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onLoginClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          <div className="w-full lg:w-[35%] h-full overflow-auto p-4 lg:p-6">
            <SlideForm onSubmit={handleGenerate} isLoading={isGenerating} />
          </div>

          <div className="w-full lg:w-[65%] h-full overflow-hidden p-4 lg:p-6 lg:pl-0">
            <SlidePreview
              slide={currentSlide}
              isLoading={isGenerating}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
