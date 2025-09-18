// Slide content generation combining S3 vectors and AI
import { getImages, getHooks } from "./s3-functions"
import { generateCustomHook, generatePageContent } from "./ai-functions"
import type { AppDetails, Slide, SlidePage, HookProvenance } from "./types"
import { DEFAULT_TEXT_STYLE, DEFAULT_IMAGE_STYLE } from "./types"

export async function generateSlideContent(appDetails: AppDetails, strategy: string): Promise<Slide> {
  try {
    // 1. Get image inspiration from S3
    const imageQuery = `${appDetails.name} ${strategy} app interface mobile`
    const imageResults = await getImages(imageQuery, 4)

    // 2. Get hook inspiration from S3
    const hookQuery = `${strategy} viral marketing ${appDetails.audience || "users"}`
    const hookResults = await getHooks(hookQuery, 1)
    const inspirationHookData = hookResults[0] || {
      key: "fallback-hook",
      score: 0.5,
      text: "Transform your experience",
      notes: "Fallback hook",
      tags: ["fallback"],
    }

    // 3. Generate custom content using AI with provenance tracking
    const { customHook, provenance } = await generateCustomHook(appDetails, inspirationHookData.text, strategy, {
      key: inspirationHookData.key,
      score: inspirationHookData.score,
      notes: inspirationHookData.notes,
      tags: inspirationHookData.tags,
    })

    // 4. Generate pages with AI content
    const pages: SlidePage[] = []

    for (let i = 0; i < 4; i++) {
      const image = imageResults[i] || {
        source_url: `/placeholder.svg?height=400&width=300&query=${appDetails.name} app page ${i + 1}`,
        score: 0.5,
      }

      let text: string
      let hookProvenance: HookProvenance | undefined

      if (i === 0) {
        text = customHook
        hookProvenance = provenance
      } else {
        text = await generatePageContent(appDetails, strategy, i)
      }

      pages.push({
        id: `page-${Date.now()}-${i}`,
        image: image.source_url,
        imageScore: image.score,
        text: text,
        textStyle: {
          ...DEFAULT_TEXT_STYLE,
          fontSize: i === 0 ? 52 : 44, // Larger text for first page
        },
        imageStyle: DEFAULT_IMAGE_STYLE,
        hookProvenance: hookProvenance,
      })
    }

    // 5. Return slide data structure
    return {
      id: `slide-${Date.now()}`,
      pages: pages,
      createdAt: new Date(),
      strategy: strategy,
      name: `${appDetails.name} - ${strategy} Slide`,
    }
  } catch (error) {
    console.error("Failed to generate slide content:", error)

    // Fallback slide generation
    const fallbackPages: SlidePage[] = Array.from({ length: 4 }, (_, i) => ({
      id: `page-${Date.now()}-${i}`,
      image: `/placeholder.svg?height=400&width=300&query=${appDetails.name} app page ${i + 1}`,
      text: i === 0 ? `Discover ${appDetails.name}` : `Page ${i + 1} content`,
      textStyle: DEFAULT_TEXT_STYLE,
      imageStyle: DEFAULT_IMAGE_STYLE,
    }))

    return {
      id: `slide-${Date.now()}`,
      pages: fallbackPages,
      createdAt: new Date(),
      strategy: strategy,
      name: `${appDetails.name} - ${strategy} Slide`,
    }
  }
}
