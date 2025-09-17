"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileArchive, CheckCircle, AlertCircle } from "lucide-react"
import type { Slide } from "@/lib/types"
import { exportSlidesToZip, downloadZip, type ExportProgress } from "@/lib/zip-exporter"

interface ExportManagerProps {
  slides: Slide[]
  appName: string
  isOpen: boolean
  onClose: () => void
}

export function ExportManager({ slides, appName, isOpen, onClose }: ExportManagerProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress>({ current: 0, total: 0, status: "" })
  const [exportComplete, setExportComplete] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleExport = async () => {
    if (slides.length === 0) return

    setIsExporting(true)
    setExportComplete(false)
    setExportError(null)

    try {
      const zipBlob = await exportSlidesToZip(slides, appName, (progress) => {
        setExportProgress(progress)
      })

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const filename = `${appName.replace(/[^a-zA-Z0-9]/g, "-")}-slides-${timestamp}.zip`

      downloadZip(zipBlob, filename)
      setExportComplete(true)
    } catch (error) {
      console.error("Export failed:", error)
      setExportError(error instanceof Error ? error.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    if (!isExporting) {
      setExportComplete(false)
      setExportError(null)
      setExportProgress({ current: 0, total: 0, status: "" })
      onClose()
    }
  }

  const totalPages = slides.reduce((total, slide) => total + slide.pages.length, 0)
  const progressPercentage = exportProgress.total > 0 ? (exportProgress.current / exportProgress.total) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5" />
            Export Slides
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">App Name:</span>
                  <span className="font-medium">{appName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Slides:</span>
                  <span className="font-medium">{slides.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Pages:</span>
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">PNG (1080x1920)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-sm text-muted-foreground">{exportProgress.status}</p>
                  <div className="text-xs text-muted-foreground">
                    {exportProgress.current} of {exportProgress.total} pages processed
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {exportComplete && (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">Export Complete!</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your slides have been downloaded as a ZIP file.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {exportError && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Export Failed</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{exportError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isExporting && !exportComplete && (
              <Button
                onClick={handleExport}
                disabled={slides.length === 0}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as ZIP
              </Button>
            )}

            {exportComplete && (
              <Button
                onClick={handleExport}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Again
              </Button>
            )}

            <Button onClick={handleClose} variant="outline" disabled={isExporting}>
              {isExporting ? "Exporting..." : "Close"}
            </Button>
          </div>

          {/* Export Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Images will be exported as high-quality PNG files (1080x1920)</p>
            <p>• Each slide will be in its own folder with numbered pages</p>
            <p>• A configuration file will be included with metadata</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
