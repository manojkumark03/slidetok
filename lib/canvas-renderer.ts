// Canvas rendering system for TikTok slides (1080x1920 dimensions)
import type { SlidePage } from "./types"

export interface CanvasRenderOptions {
  width?: number
  height?: number
  quality?: number
  format?: "png" | "jpeg"
}

const DEFAULT_OPTIONS: CanvasRenderOptions = {
  width: 1080,
  height: 1920,
  quality: 0.95,
  format: "png",
}

export async function renderPageToCanvas(
  page: SlidePage,
  options: CanvasRenderOptions = {},
): Promise<HTMLCanvasElement> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Failed to get canvas context")
  }

  canvas.width = opts.width!
  canvas.height = opts.height!

  // Clear canvas with white background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  try {
    // Load and draw background image
    const img = new Image()
    img.crossOrigin = "anonymous"

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          // Calculate image positioning and scaling
          const { scale, position, opacity } = page.imageStyle
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale

          const x = (canvas.width - scaledWidth) / 2 // center by default
          let y = (canvas.height - scaledHeight) / 2

          if (position === "top") {
            y = 0
          } else if (position === "bottom") {
            y = canvas.height - scaledHeight
          }

          // Apply opacity
          ctx.globalAlpha = opacity

          // Draw image
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

          // Reset alpha
          ctx.globalAlpha = 1

          resolve()
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = page.image
    })

    // Draw text overlay
    await drawTextOverlay(ctx, page, canvas.width, canvas.height)
  } catch (error) {
    console.error("Error rendering page:", error)
    // Draw fallback content
    drawFallbackContent(ctx, page, canvas.width, canvas.height)
  }

  return canvas
}

async function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  page: SlidePage,
  canvasWidth: number,
  canvasHeight: number,
): Promise<void> {
  const { text, textStyle } = page
  const { fontSize, color, position, fontWeight, textAlign, shadowEnabled } = textStyle

  // Set font properties
  ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = textAlign as CanvasTextAlign

  // Add text shadow if enabled
  if (shadowEnabled) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)"
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  }

  // Calculate text positioning
  const padding = 60
  const maxWidth = canvasWidth - padding * 2
  let x = canvasWidth / 2

  if (textAlign === "left") {
    x = padding
  } else if (textAlign === "right") {
    x = canvasWidth - padding
  }

  // Word wrap text
  const lines = wrapText(ctx, text, maxWidth)
  const lineHeight = fontSize * 1.2
  const totalTextHeight = lines.length * lineHeight

  let startY: number
  if (position === "top") {
    startY = padding + fontSize
  } else if (position === "bottom") {
    startY = canvasHeight - padding - totalTextHeight + fontSize
  } else {
    startY = (canvasHeight - totalTextHeight) / 2 + fontSize
  }

  // Draw each line
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight
    ctx.fillText(line, x, y)
  })

  // Reset shadow
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function drawFallbackContent(
  ctx: CanvasRenderingContext2D,
  page: SlidePage,
  canvasWidth: number,
  canvasHeight: number,
): void {
  // Draw gradient background as fallback
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
  gradient.addColorStop(0, "#8B5CF6")
  gradient.addColorStop(1, "#EC4899")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Draw text
  ctx.font = `bold ${page.textStyle.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
  ctx.shadowBlur = 4

  const lines = wrapText(ctx, page.text, canvasWidth - 120)
  const lineHeight = page.textStyle.fontSize * 1.2
  const startY = (canvasHeight - lines.length * lineHeight) / 2 + page.textStyle.fontSize

  lines.forEach((line, index) => {
    ctx.fillText(line, canvasWidth / 2, startY + index * lineHeight)
  })
}

export async function canvasToBlob(canvas: HTMLCanvasElement, options: CanvasRenderOptions = {}): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to convert canvas to blob"))
        }
      },
      `image/${opts.format}`,
      opts.quality,
    )
  })
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a")
  link.download = filename
  link.href = canvas.toDataURL("image/png")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
