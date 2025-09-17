"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, ArrowRight } from "lucide-react"
import type { AppDetails } from "@/lib/types"

interface AppDetailsFormProps {
  onSubmit: (details: AppDetails) => void
  initialData: AppDetails
}

export function AppDetailsForm({ onSubmit, initialData }: AppDetailsFormProps) {
  const [formData, setFormData] = useState<AppDetails>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = "App name is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "App description is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit(formData)
  }

  const handleChange = (field: keyof AppDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tell us about your app
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Help us create the perfect TikTok slides by sharing some details about your app
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* App Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                App Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., FitTracker Pro"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`h-12 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* App Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                App Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what your app does and its main benefits..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`min-h-[100px] resize-none ${errors.description ? "border-red-500" : ""}`}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="audience" className="text-sm font-medium">
                Target Audience <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="audience"
                placeholder="e.g., Fitness enthusiasts, busy professionals"
                value={formData.audience || ""}
                onChange={(e) => handleChange("audience", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Key Features */}
            <div className="space-y-2">
              <Label htmlFor="features" className="text-sm font-medium">
                Key Features/Benefits <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Textarea
                id="features"
                placeholder="List the main features or benefits that make your app special..."
                value={formData.features || ""}
                onChange={(e) => handleChange("features", e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
            >
              Continue to Strategy Selection
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
