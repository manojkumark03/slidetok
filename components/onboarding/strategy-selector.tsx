"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, Zap, BookOpen, AlertTriangle, BarChart3, Target } from "lucide-react"
import type { AppDetails, Strategy } from "@/lib/types"
import { generateCustomHook } from "@/lib/ai-functions"

interface StrategySelectorProps {
  appDetails: AppDetails
  strategies: Strategy[]
  selectedStrategy: string
  recommendedStrategy: string
  onSelect: (strategyId: string) => void
  onRecommendationUpdate: (recommended: string) => void
}

const strategyIcons = {
  FOMO: AlertTriangle,
  Hype: Zap,
  Educational: BookOpen,
  "Problem-Solution": Target,
  Comparison: BarChart3,
}

export function StrategySelector({
  appDetails,
  strategies,
  selectedStrategy,
  recommendedStrategy,
  onSelect,
  onRecommendationUpdate,
}: StrategySelectorProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewHooks, setPreviewHooks] = useState<Record<string, { customHook: string; originalHook: string }>>({})

  // Generate AI recommendation on mount
  useEffect(() => {
    const generateRecommendation = async () => {
      setIsAnalyzing(true)
      try {
        const description = appDetails.description.toLowerCase()
        let recommended = "Hype" // default

        if (description.includes("learn") || description.includes("tutorial") || description.includes("guide")) {
          recommended = "Educational"
        } else if (description.includes("problem") || description.includes("solution") || description.includes("fix")) {
          recommended = "Problem-Solution"
        } else if (
          description.includes("limited") ||
          description.includes("exclusive") ||
          description.includes("offer")
        ) {
          recommended = "FOMO"
        } else if (description.includes("better") || description.includes("vs") || description.includes("compare")) {
          recommended = "Comparison"
        }

        onRecommendationUpdate(recommended)

        const hooks: Record<string, { customHook: string; originalHook: string }> = {}
        for (const strategy of strategies) {
          try {
            const mockOriginalHook = `Original ${strategy.id.toLowerCase()} hook inspiration`
            const { customHook } = await generateCustomHook(appDetails, mockOriginalHook, strategy.id)
            hooks[strategy.id] = {
              customHook: customHook,
              originalHook: mockOriginalHook,
            }
          } catch (error) {
            hooks[strategy.id] = {
              customHook: `${strategy.name} hook for ${appDetails.name}`,
              originalHook: "Fallback original hook",
            }
          }
        }
        setPreviewHooks(hooks)
      } catch (error) {
        console.error("Failed to generate recommendation:", error)
      } finally {
        setIsAnalyzing(false)
      }
    }

    if (appDetails.name && appDetails.description) {
      generateRecommendation()
    }
  }, [appDetails, strategies, onRecommendationUpdate])

  const handleStrategySelect = (strategyId: string) => {
    onSelect(strategyId)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Creative Strategy
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Select the approach that best fits your app and target audience
          </CardDescription>
        </CardHeader>
      </Card>

      {isAnalyzing && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                AI is analyzing your app to recommend the best strategy...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {recommendedStrategy && !isAnalyzing && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200 dark:border-green-800 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">AI Recommendation</h3>
                <p className="text-green-700 dark:text-green-300">
                  Based on your app details, we recommend the{" "}
                  <strong>{strategies.find((s) => s.id === recommendedStrategy)?.name}</strong> strategy. This approach
                  works well for apps like yours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => {
          const Icon = strategyIcons[strategy.id as keyof typeof strategyIcons] || Target
          const isRecommended = strategy.id === recommendedStrategy
          const isSelected = strategy.id === selectedStrategy
          const previewHook = previewHooks[strategy.id]

          return (
            <Card
              key={strategy.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                isSelected
                  ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950"
                  : "bg-white/70 backdrop-blur-sm hover:bg-white/80"
              }`}
              onClick={() => handleStrategySelect(strategy.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-3 rounded-full ${
                      isSelected ? "bg-purple-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {isRecommended && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Recommended
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold">{strategy.name}</CardTitle>
                <CardDescription className="text-sm">{strategy.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {previewHook && (
                  <div className="mb-4 space-y-3">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        ✨ AI-Customized Hook:
                      </p>
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        "{previewHook.customHook}"
                      </p>
                    </div>

                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        📝 Original Inspiration:
                      </p>
                      <p className="text-xs italic text-gray-600 dark:text-gray-300">"{previewHook.originalHook}"</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Examples:</p>
                  <ul className="space-y-1">
                    {strategy.examples.slice(0, 2).map((example, index) => (
                      <li key={index} className="text-xs text-gray-500 dark:text-gray-400">
                        • {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedStrategy && (
        <div className="mt-8 text-center">
          <Button
            onClick={() => handleStrategySelect(selectedStrategy)}
            className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
          >
            Create Slides with {strategies.find((s) => s.id === selectedStrategy)?.name}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
