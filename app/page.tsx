"use client"

import { useState } from "react"
import { AppDetailsForm } from "@/components/onboarding/app-details-form"
import { StrategySelector } from "@/components/onboarding/strategy-selector"
import { SlideEditor } from "@/components/editor/slide-editor"
import { PageEditor } from "@/components/editor/page-editor"
import { type AppDetails, type AppState, STRATEGIES } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function TikTokGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [appState, setAppState] = useState<AppState>({
    appDetails: { name: "", description: "" },
    selectedStrategy: "",
    recommendedStrategy: "",
    slides: [],
    currentSlide: 0,
    editingPage: null,
    isLoading: false,
    isExporting: false,
    searchQuery: "",
    selectedImages: [],
    imageSearchCache: new Map(),
    hookSearchCache: new Map(),
  })

  const handleAppDetailsSubmit = (details: AppDetails) => {
    setAppState((prev) => ({ ...prev, appDetails: details }))
    setCurrentStep(2)
  }

  const handleStrategySelect = (strategyId: string) => {
    setAppState((prev) => ({ ...prev, selectedStrategy: strategyId }))
    setCurrentStep(3)
  }

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }))
  }

  const handlePageEdit = (pageId: string) => {
    updateAppState({ editingPage: pageId })
  }

  const handlePageSave = (updatedPage: any) => {
    const updatedSlides = [...appState.slides]

    // Find which slide contains the page being edited
    let targetSlideIndex = -1
    let targetPageIndex = -1

    for (let slideIndex = 0; slideIndex < updatedSlides.length; slideIndex++) {
      const pageIndex = updatedSlides[slideIndex].pages.findIndex((p) => p.id === updatedPage.id)
      if (pageIndex !== -1) {
        targetSlideIndex = slideIndex
        targetPageIndex = pageIndex
        break
      }
    }

    if (targetSlideIndex !== -1 && targetPageIndex !== -1) {
      updatedSlides[targetSlideIndex].pages[targetPageIndex] = updatedPage
      updateAppState({ slides: updatedSlides, editingPage: null })
    }
  }

  const getCurrentEditingPage = () => {
    if (!appState.editingPage) return null

    // Search through all slides to find the page being edited
    for (const slide of appState.slides) {
      const page = slide.pages.find((p) => p.id === appState.editingPage)
      if (page) return page
    }

    return null
  }

  const progressValue = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            TikTok Slide Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create viral TikTok carousel slides with AI-powered content and professional design
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep < 3 && (
          <Card className="max-w-2xl mx-auto mb-8 p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Step {currentStep} of 3</span>
              <span className="text-sm font-medium text-muted-foreground">{Math.round(progressValue)}% Complete</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>App Details</span>
              <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Strategy</span>
              <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Create Slides</span>
            </div>
          </Card>
        )}

        {/* Step Content */}
        {currentStep === 1 && <AppDetailsForm onSubmit={handleAppDetailsSubmit} initialData={appState.appDetails} />}

        {currentStep === 2 && (
          <StrategySelector
            appDetails={appState.appDetails}
            strategies={STRATEGIES}
            selectedStrategy={appState.selectedStrategy}
            recommendedStrategy={appState.recommendedStrategy}
            onSelect={handleStrategySelect}
            onRecommendationUpdate={(recommended) =>
              setAppState((prev) => ({ ...prev, recommendedStrategy: recommended }))
            }
          />
        )}

        {currentStep === 3 && <SlideEditor appState={appState} onStateUpdate={updateAppState} />}

        {/* Page Editor Modal */}
        <PageEditor
          page={getCurrentEditingPage()}
          appDetails={appState.appDetails}
          strategy={appState.selectedStrategy}
          isOpen={!!appState.editingPage}
          onClose={() => updateAppState({ editingPage: null })}
          onSave={handlePageSave}
        />
      </div>
    </div>
  )
}
