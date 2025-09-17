// ZIP export functionality for multiple slides
import JSZip from "jszip"
import type { Slide } from "./types"
import { renderPageToCanvas, canvasToBlob } from "./canvas-renderer"

export interface ExportProgress {
  current: number
  total: number
  status: string
}

export async function exportSlidesToZip(
  slides: Slide[],
  appName: string,
  onProgress?: (progress: ExportProgress) => void,
): Promise<Blob> {
  const zip = new JSZip()
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
  const folderName = `${appName.replace(/[^a-zA-Z0-9]/g, "-")}-slides-${timestamp}`

  let currentStep = 0
  const totalSteps = slides.reduce((total, slide) => total + slide.pages.length, 0)

  // Create metadata file
  const metadata = {
    appName,
    exportDate: new Date().toISOString(),
    totalSlides: slides.length,
    totalPages: totalSteps,
    slides: slides.map((slide, index) => ({
      slideNumber: index + 1,
      slideName: slide.name || `Slide ${index + 1}`,
      strategy: slide.strategy,
      pageCount: slide.pages.length,
      createdAt: slide.createdAt,
    })),
  }

  zip.file(`${folderName}/slide-config.json`, JSON.stringify(metadata, null, 2))

  // Process each slide
  for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
    const slide = slides[slideIndex]
    const slideFolder = `${folderName}/Slide-${String(slideIndex + 1).padStart(2, "0")}`

    onProgress?.({
      current: currentStep,
      total: totalSteps,
      status: `Processing Slide ${slideIndex + 1}...`,
    })

    // Process each page in the slide
    for (let pageIndex = 0; pageIndex < slide.pages.length; pageIndex++) {
      const page = slide.pages[pageIndex]
      const filename = `page-${pageIndex + 1}.png`

      try {
        onProgress?.({
          current: currentStep,
          total: totalSteps,
          status: `Rendering Slide ${slideIndex + 1}, Page ${pageIndex + 1}...`,
        })

        // Render page to canvas
        const canvas = await renderPageToCanvas(page, {
          width: 1080,
          height: 1920,
          quality: 0.95,
          format: "png",
        })

        // Convert to blob
        const blob = await canvasToBlob(canvas, { format: "png" })

        // Add to zip
        zip.file(`${slideFolder}/${filename}`, blob)

        currentStep++
      } catch (error) {
        console.error(`Failed to render slide ${slideIndex + 1}, page ${pageIndex + 1}:`, error)

        // Create error placeholder
        const errorBlob = await createErrorPlaceholder(
          `Failed to render\nSlide ${slideIndex + 1}, Page ${pageIndex + 1}`,
        )
        zip.file(`${slideFolder}/${filename}`, errorBlob)

        currentStep++
      }
    }
  }

  onProgress?.({
    current: totalSteps,
    total: totalSteps,
    status: "Generating ZIP file...",
  })

  // Generate ZIP
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  })

  return zipBlob
}

async function createErrorPlaceholder(errorText: string): Promise<Blob> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Failed to get canvas context")
  }

  canvas.width = 1080
  canvas.height = 1920

  // Red background
  ctx.fillStyle = "#EF4444"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // White text
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  ctx.textAlign = "center"
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
  ctx.shadowBlur = 4

  const lines = errorText.split("\n")
  const lineHeight = 60
  const startY = (canvas.height - lines.length * lineHeight) / 2 + 48

  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, startY + index * lineHeight)
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to create error placeholder"))
        }
      },
      "image/png",
      0.95,
    )
  })
}

export function downloadZip(zipBlob: Blob, filename: string): void {
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
