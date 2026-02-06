"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Loader2, Sparkles, Paperclip, ChevronDown, ChevronUp } from "lucide-react";
import {
  SlideType,
  Audience,
  SLIDE_TYPES,
  AUDIENCES,
} from "../lib/types";
import type { GenerateSlideRequest, PresentationMode } from "../lib/types";

interface SlideFormProps {
  onSubmit: (data: GenerateSlideRequest) => void;
  isLoading: boolean;
}

export function SlideForm({ onSubmit, isLoading }: SlideFormProps) {
  const [slideType, setSlideType] = useState<SlideType>("auto");
  const [audience, setAudience] = useState<Audience>("auto");
  const [context, setContext] = useState("");
  const [keyTakeaway, setKeyTakeaway] = useState("");
  const [dataInput, setDataInput] = useState("");
  const [presentationMode, setPresentationMode] = useState<PresentationMode>("presentation");
  const [fileName, setFileName] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setDataInput(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      slideType,
      audience,
      context,
      keyTakeaway,
      presentationMode,
      dataInput: dataInput || undefined,
    });
  };

  const isFormValid =
    context.length >= 10 && keyTakeaway.length >= 5;

  return (
    <Card className="h-full border-slate-200 bg-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Generate Slide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Context Dump - Primary Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="context" className="text-slate-900 font-medium">
                Context Dump
              </Label>
              <span className="text-xs text-slate-500">
                {context.length}/2000
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Paste everything you know — research, notes, data, background. The AI will structure it.
            </p>
            <Textarea
              id="context"
              placeholder="Dump everything here: research findings, meeting notes, data points, client background, market info, competitive analysis..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[140px] bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none"
              minLength={10}
              maxLength={2000}
              required
            />
          </div>

          <Separator className="bg-slate-200" />

          {/* What's the Message - Key Takeaway */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="keyTakeaway" className="text-slate-900 font-medium">
                What&apos;s the Message?
              </Label>
              <span className="text-xs text-slate-500">
                {keyTakeaway.length}/150
              </span>
            </div>
            <p className="text-xs text-slate-500">
              The single most important thing your audience should remember.
            </p>
            <Textarea
              id="keyTakeaway"
              placeholder="e.g., &apos;We need to enter the European market by Q3 to capture first-mover advantage&apos;"
              value={keyTakeaway}
              onChange={(e) => setKeyTakeaway(e.target.value)}
              className="min-h-[80px] bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none"
              minLength={5}
              maxLength={150}
              required
            />
          </div>

          <Separator className="bg-slate-200" />

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="font-medium">Advanced Options</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Advanced Options Panel */}
          {showAdvanced && (
            <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">
              
              {/* Slide Type */}
              <div className="space-y-2">
                <Label htmlFor="slideType" className="text-slate-700">
                  Slide Type
                </Label>
                <Select value={slideType} onValueChange={(v) => setSlideType(v as SlideType)}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {SLIDE_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="text-slate-900 focus:bg-slate-100"
                      >
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-slate-500">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience" className="text-slate-700">
                  Target Audience
                </Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {AUDIENCES.map((aud) => (
                      <SelectItem
                        key={aud.value}
                        value={aud.value}
                        className="text-slate-900 focus:bg-slate-100"
                      >
                        <div className="flex flex-col">
                          <span>{aud.label}</span>
                          <span className="text-xs text-slate-500">{aud.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Presentation Mode Toggle */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="presentation-mode" className="text-slate-700 text-sm">
                    {presentationMode === "presentation" ? "Presentation-style" : "Read-style"}
                  </Label>
                  <p className="text-xs text-slate-500">
                    {presentationMode === "presentation"
                      ? "Minimal text, bullet points for live presenting"
                      : "Detailed content with full sentences for reading"}
                  </p>
                </div>
                <Switch
                  id="presentation-mode"
                  checked={presentationMode === "read"}
                  onCheckedChange={(checked) =>
                    setPresentationMode(checked ? "read" : "presentation")
                  }
                />
              </div>

              {/* Data Input */}
              <div className="space-y-2">
                <Label className="text-slate-700">Data &amp; Metrics (Optional)</Label>
                <Textarea
                  placeholder="Paste data, metrics, or CSV content here..."
                  value={dataInput}
                  onChange={(e) => setDataInput(e.target.value)}
                  className="min-h-[80px] bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none font-mono text-sm"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv,.txt,.json,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="data-file"
                  />
                  <Label
                    htmlFor="data-file"
                    className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    {fileName || "Attach file (.csv, .txt, .json, .xlsx)"}
                  </Label>
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-slate-200" />

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Slide
              </>
            )}
          </Button>

          {!isFormValid && (
            <p className="text-xs text-slate-500 text-center">
              Add context (10+ chars) and a message (5+ chars) to generate
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
