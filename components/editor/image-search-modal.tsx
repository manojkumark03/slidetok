"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Sparkles, ImageIcon, Upload } from "lucide-react"
import type { AppDetails } from "@/lib/types"

interface ImageSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (imageUrl: string) => void
  searchResults: any[]
  onSearch: (query: string) => Promise<void>
  isSearching: boolean
  appDetails: AppDetails
  strategy: string
}

export function ImageSearchModal({
  isOpen,
  onClose,
  onImageSelect,
  searchResults,
  onSearch,
  isSearching,
  appDetails,
  strategy,
}: ImageSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      await onSearch(searchQuery.trim())
    }
  }

  const handleQuickSearch = async (query: string) => {
    setSearchQuery(query)
    await onSearch(query)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      // Create a blob URL for the uploaded image
      const imageUrl = URL.createObjectURL(file)
      onImageSelect(imageUrl)
    } catch (error) {
      console.error("Failed to upload image:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const quickSearches = [
    `${appDetails.name} app interface`,
    `${strategy} marketing background`,
    "mobile app mockup",
    "user testimonial photo",
    "app store screenshot",
    "social media post",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Search & Upload Images
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Images
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Image
              </TabsTrigger>
            </TabsList>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for images..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <div className="animate-spin mr-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
              </form>

              {/* Quick Searches */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick searches:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSearches.map((query, index) => (
                    <Button
                      key={index}
                      onClick={() => handleQuickSearch(query)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={isSearching}
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Search Results</h3>
                    <Badge variant="secondary">{searchResults.length} images found</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.map((result, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => onImageSelect(result.source_url)}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-t-lg">
                            <img
                              src={result.source_url || "/placeholder.svg"}
                              alt={result.notes || "Search result"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                Score: {Math.round(result.score * 100)}%
                              </Badge>
                            </div>
                            {result.notes && <p className="text-xs text-muted-foreground truncate">{result.notes}</p>}
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {searchResults.length === 0 && !isSearching && (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No images found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try searching for something else or use one of the quick searches above.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="text-center py-12">
                  <div className="animate-spin mx-auto mb-4">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Searching images...</h3>
                  <p className="text-muted-foreground">Finding the perfect images for your slide.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Upload Your Own Image</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload a custom image from your device (max 5MB, JPG/PNG/GIF)
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.add("border-purple-400")
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove("border-purple-400")
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove("border-purple-400")
                    const files = e.dataTransfer.files
                    if (files.length > 0) {
                      const event = { target: { files } } as React.ChangeEvent<HTMLInputElement>
                      handleImageUpload(event)
                    }
                  }}
                >
                  {isUploading ? (
                    <div className="space-y-4">
                      <div className="animate-spin mx-auto">
                        <Upload className="w-12 h-12 text-purple-600" />
                      </div>
                      <p className="text-lg font-medium">Uploading image...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">Supports JPG, PNG, GIF up to 5MB</p>
                      </div>
                      <Button variant="outline" className="mt-4 bg-transparent">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
