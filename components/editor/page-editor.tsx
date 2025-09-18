"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search, Palette, Type, ImageIcon, Save, X, Lightbulb } from "lucide-react"
import type { SlidePage, AppDetails, TextStyle, ImageStyle } from "@/lib/types"
import { generatePageContent } from "@/lib/ai-functions"
import { getImages } from "@/lib/s3-functions"
import { ImageSearchModal } from "./image-search-modal"

interface PageEditorProps {
  page: SlidePage | null
  appDetails: AppDetails
  strategy: string
  isOpen: boolean
  onClose: () => void
  onSave: (updatedPage: SlidePage) => void
}

export function PageEditor({ page, appDetails, strategy, isOpen, onClose, onSave }: PageEditorProps) {
  const [editedPage, setEditedPage] = useState<SlidePage | null>(null)
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false)
  const [imageSearchResults, setImageSearchResults] = useState<any[]>([])
  const [isSearchingImages, setIsSearchingImages] = useState(false)

  useEffect(() => {
    if (page) {
      setEditedPage({ ...page })
    }
  }, [page])

  if (!editedPage) return null

  const handleTextChange = (text: string) => {
    setEditedPage((prev) => (prev ? { ...prev, text } : null))
  }

  const handleTextStyleChange = (updates: Partial<TextStyle>) => {
    setEditedPage((prev) =>
      prev
        ? {
            ...prev,
            textStyle: { ...prev.textStyle, ...updates },
          }
        : null,
    )
  }

  const handleImageStyleChange = (updates: Partial<ImageStyle>) => {
    setEditedPage((prev) =>
      prev
        ? {
            ...prev,
            imageStyle: { ...prev.imageStyle, ...updates },
          }
        : null,
    )
  }

  const handleRegenerateText = async () => {
    if (!editedPage) return

    setIsGeneratingText(true)
    try {
      const pageIndex = 0 // You might want to pass this as a prop
      const newText = await generatePageContent(appDetails, strategy, pageIndex)
      handleTextChange(newText)
    } catch (error) {
      console.error("Failed to regenerate text:", error)
    } finally {
      setIsGeneratingText(false)
    }
  }

  const handleImageSearch = async (query: string) => {
    setIsSearchingImages(true)
    try {
      const results = await getImages(query, 12)
      setImageSearchResults(results)
    } catch (error) {
      console.error("Image search failed:", error)
      setImageSearchResults([])
    } finally {
      setIsSearchingImages(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    setEditedPage((prev) => (prev ? { ...prev, image: imageUrl } : null))
    setIsImageSearchOpen(false)
  }

  const handleSave = () => {
    if (editedPage) {
      onSave(editedPage)
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Edit Page
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Live Preview</h3>
              <Card className="aspect-[9/16] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <CardContent className="p-0 h-full relative">
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                    style={{
                      backgroundImage: `url(${editedPage.image})`,
                      opacity: editedPage.imageStyle.opacity,
                      transform: `scale(${editedPage.imageStyle.scale})`,
                    }}
                  />

                  {/* Text Overlay */}
                  <div
                    className={`absolute inset-0 flex p-6 transition-all duration-300 ${
                      editedPage.textStyle.position === "top"
                        ? "items-start pt-8"
                        : editedPage.textStyle.position === "bottom"
                          ? "items-end pb-8"
                          : "items-center"
                    } ${
                      editedPage.textStyle.textAlign === "left"
                        ? "justify-start"
                        : editedPage.textStyle.textAlign === "right"
                          ? "justify-end"
                          : "justify-center"
                    }`}
                  >
                    <p
                      className={`font-bold leading-tight max-w-full break-words ${
                        editedPage.textStyle.shadowEnabled ? "drop-shadow-lg" : ""
                      }`}
                      style={{
                        color: editedPage.textStyle.color,
                        fontSize: `${editedPage.textStyle.fontSize / 3}px`, // Scale for preview
                        fontWeight: editedPage.textStyle.fontWeight,
                        textAlign: editedPage.textStyle.textAlign,
                      }}
                    >
                      {editedPage.text}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {editedPage.hookProvenance && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      Hook Inspiration & AI Customization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-white/50">
                          Original Hook
                        </Badge>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Score: {(editedPage.hookProvenance.originalScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm italic text-gray-700 dark:text-gray-300 bg-white/30 p-2 rounded">
                        "{editedPage.hookProvenance.originalHook}"
                      </p>
                      {editedPage.hookProvenance.originalNotes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          📝 {editedPage.hookProvenance.originalNotes}
                        </p>
                      )}
                      {editedPage.hookProvenance.originalTags && editedPage.hookProvenance.originalTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {editedPage.hookProvenance.originalTags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          AI Customized
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {editedPage.hookProvenance.strategy}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-purple-800 dark:text-purple-200 bg-white/50 p-2 rounded">
                        "{editedPage.hookProvenance.customizedHook}"
                      </p>
                    </div>

                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                        View AI Customization Prompt
                      </summary>
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto">
                        {editedPage.hookProvenance.customizationPrompt}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Editor */}
            <div className="space-y-4">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </TabsTrigger>
                </TabsList>

                {/* Text Editor */}
                <TabsContent value="text" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Text Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Text</Label>
                        <Textarea
                          value={editedPage.text}
                          onChange={(e) => handleTextChange(e.target.value)}
                          placeholder="Enter your text..."
                          className="min-h-[100px]"
                        />
                        <Button
                          onClick={handleRegenerateText}
                          disabled={isGeneratingText}
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                        >
                          {isGeneratingText ? (
                            <div className="animate-spin mr-2">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          Regenerate with AI
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Slider
                            value={[editedPage.textStyle.fontSize]}
                            onValueChange={([value]) => handleTextStyleChange({ fontSize: value })}
                            min={24}
                            max={72}
                            step={2}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">{editedPage.textStyle.fontSize}px</span>
                        </div>

                        <div className="space-y-2">
                          <Label>Text Color</Label>
                          <Input
                            type="color"
                            value={editedPage.textStyle.color}
                            onChange={(e) => handleTextStyleChange({ color: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select
                            value={editedPage.textStyle.position}
                            onValueChange={(value: "top" | "center" | "bottom") =>
                              handleTextStyleChange({ position: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Top</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="bottom">Bottom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Alignment</Label>
                          <Select
                            value={editedPage.textStyle.textAlign}
                            onValueChange={(value: "left" | "center" | "right") =>
                              handleTextStyleChange({ textAlign: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Font Weight</Label>
                          <Select
                            value={editedPage.textStyle.fontWeight}
                            onValueChange={(value: "normal" | "semibold" | "bold") =>
                              handleTextStyleChange({ fontWeight: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="semibold">Semibold</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editedPage.textStyle.shadowEnabled}
                              onChange={(e) => handleTextStyleChange({ shadowEnabled: e.target.checked })}
                              className="rounded"
                            />
                            Text Shadow
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Image Editor */}
                <TabsContent value="image" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Background Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Current Image</Label>
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={editedPage.image || "/placeholder.svg"}
                            alt="Current background"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button onClick={() => setIsImageSearchOpen(true)} variant="outline" className="w-full">
                          <Search className="w-4 h-4 mr-2" />
                          Search & Replace Image
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Opacity</Label>
                          <Slider
                            value={[editedPage.imageStyle.opacity]}
                            onValueChange={([value]) => handleImageStyleChange({ opacity: value })}
                            min={0.1}
                            max={1}
                            step={0.1}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(editedPage.imageStyle.opacity * 100)}%
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Label>Scale</Label>
                          <Slider
                            value={[editedPage.imageStyle.scale]}
                            onValueChange={([value]) => handleImageStyleChange({ scale: value })}
                            min={0.5}
                            max={2}
                            step={0.1}
                            className="w-full"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(editedPage.imageStyle.scale * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select
                          value={editedPage.imageStyle.position}
                          onValueChange={(value: "center" | "top" | "bottom") =>
                            handleImageStyleChange({ position: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={onClose} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Search Modal */}
      <ImageSearchModal
        isOpen={isImageSearchOpen}
        onClose={() => setIsImageSearchOpen(false)}
        onImageSelect={handleImageSelect}
        searchResults={imageSearchResults}
        onSearch={handleImageSearch}
        isSearching={isSearchingImages}
        appDetails={appDetails}
        strategy={strategy}
      />
    </>
  )
}
