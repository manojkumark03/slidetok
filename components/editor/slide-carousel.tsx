"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit3, Plus, Trash2 } from "lucide-react"
import type { Slide, SlidePage } from "@/lib/types"
import { DEFAULT_TEXT_STYLE, DEFAULT_IMAGE_STYLE } from "@/lib/types"

interface SlideCarouselProps {
  slide: Slide
  isActive: boolean
  onSlideUpdate: (slide: Slide) => void
  onPageEdit: (pageId: string) => void
}

export function SlideCarousel({ slide, isActive, onSlideUpdate, onPageEdit }: SlideCarouselProps) {
  const [draggedPage, setDraggedPage] = useState<string | null>(null)

  const handleAddPage = () => {
    const newPage: SlidePage = {
      id: `page-${Date.now()}`,
      image: "/modern-app-interface.png",
      text: "New page content",
      textStyle: DEFAULT_TEXT_STYLE,
      imageStyle: DEFAULT_IMAGE_STYLE,
    }

    const updatedSlide = {
      ...slide,
      pages: [...slide.pages, newPage],
    }

    onSlideUpdate(updatedSlide)
  }

  const handleDeletePage = (pageId: string) => {
    if (slide.pages.length <= 1) return // Don't allow deleting the last page

    const updatedSlide = {
      ...slide,
      pages: slide.pages.filter((page) => page.id !== pageId),
    }

    onSlideUpdate(updatedSlide)
  }

  const handleDragStart = (pageId: string) => {
    setDraggedPage(pageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetPageId: string) => {
    e.preventDefault()
    if (!draggedPage || draggedPage === targetPageId) return

    const draggedIndex = slide.pages.findIndex((page) => page.id === draggedPage)
    const targetIndex = slide.pages.findIndex((page) => page.id === targetPageId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newPages = [...slide.pages]
    const [draggedPageObj] = newPages.splice(draggedIndex, 1)
    newPages.splice(targetIndex, 0, draggedPageObj)

    onSlideUpdate({
      ...slide,
      pages: newPages,
    })

    setDraggedPage(null)
  }

  return (
    <div className="space-y-4">
      {/* Page Count and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{slide.pages.length} pages</Badge>
          <span className="text-xs text-muted-foreground">Drag to reorder</span>
        </div>
        <Button
          onClick={handleAddPage}
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950 bg-transparent"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Page
        </Button>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slide.pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={() => handleDragStart(page.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, page.id)}
            className={`relative group cursor-move transition-all duration-200 ${
              draggedPage === page.id ? "opacity-50 scale-95" : "hover:scale-105"
            }`}
          >
            <Card className="aspect-[9/16] overflow-hidden bg-gray-100 dark:bg-gray-800">
              <CardContent className="p-0 h-full relative">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${page.image})`,
                    opacity: page.imageStyle.opacity,
                    transform: `scale(${page.imageStyle.scale})`,
                  }}
                />

                {/* Text Overlay */}
                <div
                  className={`absolute inset-0 flex items-center justify-center p-3 ${
                    page.textStyle.position === "top"
                      ? "items-start pt-6"
                      : page.textStyle.position === "bottom"
                        ? "items-end pb-6"
                        : "items-center"
                  }`}
                >
                  <p
                    className={`text-center font-bold leading-tight ${
                      page.textStyle.shadowEnabled ? "drop-shadow-lg" : ""
                    }`}
                    style={{
                      color: page.textStyle.color,
                      fontSize: `${page.textStyle.fontSize / 4}px`, // Scale down for preview
                      fontWeight: page.textStyle.fontWeight,
                      textAlign: page.textStyle.textAlign,
                    }}
                  >
                    {page.text}
                  </p>
                </div>

                {/* Page Number */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {index + 1}
                  </Badge>
                </div>

                {/* Edit Overlay */}
                {isActive && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onPageEdit(page.id)}
                        size="sm"
                        className="bg-white/90 text-gray-900 hover:bg-white"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      {slide.pages.length > 1 && (
                        <Button
                          onClick={() => handleDeletePage(page.id)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/90 hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Page Info */}
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground truncate">{page.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
