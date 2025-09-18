// Type definitions for the TikTok Slide Generator

export interface AppDetails {
  name: string
  description: string
  audience?: string
  features?: string
}

export interface Strategy {
  id: string
  name: string
  description: string
  examples: string[]
}

export interface TextStyle {
  fontSize: number
  color: string
  position: "top" | "center" | "bottom"
  shadowEnabled: boolean
  fontWeight: "normal" | "bold" | "semibold"
  textAlign: "left" | "center" | "right"
}

export interface ImageStyle {
  opacity: number
  scale: number
  position: "center" | "top" | "bottom"
  filter?: string
}

export interface SlidePage {
  id: string
  image: string
  imageScore?: number
  text: string
  textStyle: TextStyle
  imageStyle: ImageStyle
  hookProvenance?: HookProvenance
}

export interface Slide {
  id: string
  pages: SlidePage[]
  createdAt: Date
  strategy: string
  name?: string
}

export interface AppState {
  // Onboarding
  appDetails: AppDetails

  // Strategy
  selectedStrategy: string
  recommendedStrategy: string

  // Slides
  slides: Slide[]

  // UI State
  currentSlide: number
  editingPage: string | null
  isLoading: boolean
  isExporting: boolean
  searchQuery: string
  selectedImages: string[]

  // Cache
  imageSearchCache: Map<string, any[]>
  hookSearchCache: Map<string, any[]>
}

export interface HookProvenance {
  originalHook: string
  originalKey: string
  originalScore: number
  originalNotes?: string
  originalTags?: string[]
  customizedHook: string
  strategy: string
  customizationPrompt: string
}

export const STRATEGIES: Strategy[] = [
  {
    id: "FOMO",
    name: "FOMO Strategy",
    description: "Limited time offers, urgency-based content",
    examples: [
      "Only 24 hours left to download",
      "Last chance to get premium features",
      "Don't miss out on this exclusive app",
    ],
  },
  {
    id: "Hype",
    name: "Hype Strategy",
    description: "Viral trends, social proof, buzz creation",
    examples: [
      "10M+ users can't be wrong",
      "The app everyone's talking about",
      "Going viral for all the right reasons",
    ],
  },
  {
    id: "Educational",
    name: "Educational Strategy",
    description: "How-to content, tutorials, tips",
    examples: [
      "How to 10x your productivity",
      "The secret feature nobody knows",
      "Tutorial: Master this app in 5 minutes",
    ],
  },
  {
    id: "Problem-Solution",
    name: "Problem-Solution",
    description: "Pain points and solutions",
    examples: [
      "Tired of apps that don't work?",
      "Finally, an app that gets it right",
      "The solution you've been waiting for",
    ],
  },
  {
    id: "Comparison",
    name: "Comparison Strategy",
    description: "Before/after, competitor comparison",
    examples: ["Why we're better than the rest", "Before vs After using our app", "The difference is night and day"],
  },
]

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 48,
  color: "#ffffff",
  position: "center",
  shadowEnabled: true,
  fontWeight: "bold",
  textAlign: "center",
}

export const DEFAULT_IMAGE_STYLE: ImageStyle = {
  opacity: 0.8,
  scale: 1.0,
  position: "center",
}
