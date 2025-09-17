"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Download, Sparkles, Trash2, Copy } from "lucide-react"
import { SlideCarousel } from "./slide-carousel"
import { ExportManager } from "../export/export-manager"
import { generateSlideContent } from "@/lib/slide-generator"
import type { AppState, Slide } from "@/lib/types"

interface SlideEditorProps {
  appState: AppState
  onStateUpdate: (updates: Partial<AppState>) => void
}

export function SlideEditor({ appState, onStateUpdate }: SlideEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  // Generate initial slide on mount
  useEffect(() => {
    if (appState.slides.length === 0) {
      handleGenerateSlide("new")
    }
  }, [])

  const handleGenerateSlide = async (type: "new" | "replicate") => {
    setIsGenerating(true)
    try {
      const newSlide = await generateSlideContent(appState.appDetails, appState.selectedStrategy)

      if (type === "replicate" && appState.slides.length > 0) {
        // Replicate the last slide structure but with new content
        const lastSlide = appState.slides[appState.slides.length - 1]
        newSlide.pages = lastSlide.pages.map((page, index) => ({
          ...(newSlide.pages[index] || page),
          textStyle: page.textStyle,
          imageStyle: page.imageStyle,
        }))
      }

      const updatedSlides = [...appState.slides, newSlide]
      onStateUpdate({
        slides: updatedSlides,
        currentSlide: updatedSlides.length - 1,
      })
    } catch (error) {
      console.error("Failed to generate slide:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteSlide = (slideIndex: number) => {
    const updatedSlides = appState.slides.filter((_, index) => index !== slideIndex)
    const newCurrentSlide = Math.min(appState.currentSlide, updatedSlides.length - 1)

    onStateUpdate({
      slides: updatedSlides,
      currentSlide: Math.max(0, newCurrentSlide),
    })
  }

  const handleSlideSelect = (slideIndex: number) => {
    onStateUpdate({ currentSlide: slideIndex })
  }

  const handleSlideUpdate = (slideIndex: number, updatedSlide: Slide) => {
    const updatedSlides = [...appState.slides]
    updatedSlides[slideIndex] = updatedSlide
    onStateUpdate({ slides: updatedSlides })
  }

  const canAddMoreSlides = appState.slides.length < 10

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {appState.appDetails.name} - Slide Editor
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Strategy: {appState.selectedStrategy} • {appState.slides.length} of 10 slides
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                {appState.slides.reduce((total, slide) => total + slide.pages.length, 0)} pages total
              </Badge>
              <Button
                onClick={() => setIsExportOpen(true)}
                disabled={appState.slides.length === 0}
                variant="outline"
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 hover:from-green-700 hover:to-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Slide Management */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Slides</h2>
        <div className="flex items-center gap-2">
          {canAddMoreSlides && (
            <>
              <Button
                onClick={() => handleGenerateSlide("new")}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {isGenerating ? (
                  <div className="animate-spin mr-2">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                New Generation
              </Button>
              {appState.slides.length > 0 && (
                <Button
                  onClick={() => handleGenerateSlide("replicate")}
                  disabled={isGenerating}
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Replicate Previous
                </Button>
              )}
            </>
          )}
          {!canAddMoreSlides && <p className="text-sm text-muted-foreground">Maximum 10 slides reached</p>}
        </div>
      </div>

      {/* Slides Grid */}
      {appState.slides.length > 0 ? (
        <div className="grid gap-6">
          {appState.slides.map((slide, slideIndex) => (
            <Card
              key={slide.id}
              className={`transition-all duration-200 ${
                slideIndex === appState.currentSlide
                  ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950"
                  : "bg-white/70 backdrop-blur-sm hover:shadow-lg"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      Slide {slideIndex + 1}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {slide.pages.length} pages • {slide.strategy} strategy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSlideSelect(slideIndex)}
                      className={slideIndex === appState.currentSlide ? "bg-purple-100 dark:bg-purple-900" : ""}
                    >
                      {slideIndex === appState.currentSlide ? "Editing" : "Select"}
                    </Button>
                    {appState.slides.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlide(slideIndex)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <SlideCarousel
                  slide={slide}
                  isActive={slideIndex === appState.currentSlide}
                  onSlideUpdate={(updatedSlide) => handleSlideUpdate(slideIndex, updatedSlide)}
                  onPageEdit={(pageId) => onStateUpdate({ editingPage: pageId })}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Ready to create your first slide?
            </h3>
            <p className="text-muted-foreground mb-6">
              We'll generate a 4-page TikTok carousel based on your app details and selected strategy.
            </p>
            <Button
              onClick={() => handleGenerateSlide("new")}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isGenerating ? (
                <div className="animate-spin mr-2">
                  <Sparkles className="w-4 h-4" />
                </div>
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Generate First Slide
            </Button>
          </CardContent>
        </Card>
      )}

      <ExportManager
        slides={appState.slides}
        appName={appState.appDetails.name}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  )
}
