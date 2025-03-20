"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Database, X, Save, Upload } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KnowledgeBaseProps {
  knowledgeBase: string
  setKnowledgeBase: (value: string) => void
  isOpen: boolean
  onClose: () => void
}

export function KnowledgeBase({ knowledgeBase, setKnowledgeBase, isOpen, onClose }: KnowledgeBaseProps) {
  const [tempKnowledge, setTempKnowledge] = useState(knowledgeBase)

  const handleSave = () => {
    setKnowledgeBase(tempKnowledge)
    onClose()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setTempKnowledge(event.target.result as string)
      }
    }
    reader.readAsText(file)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span>Nordic-Robot AI Knowledge Base</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-grow p-4 overflow-hidden">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <label>
                <Upload className="h-4 w-4" />
                <span>Upload File</span>
                <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={handleFileUpload} />
              </label>
            </Button>
            <p className="text-xs text-muted-foreground">Upload text files to use as context for the AI</p>
          </div>

          <ScrollArea className="h-[calc(100%-3rem)]">
            <Textarea
              value={tempKnowledge}
              onChange={(e) => setTempKnowledge(e.target.value)}
              placeholder="Paste or type knowledge base content here. This information will be used as context when generating responses."
              className="min-h-[50vh] resize-none"
            />
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Save Knowledge Base</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

