"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { parseCodeBlocks } from "../utils/code-parser"
import { CodeBlock } from "./code-block"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageContentProps {
  content: string
  role: "user" | "assistant"
}

export function MessageContent({ content, role }: MessageContentProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy message: ", err)
    }
  }

  // For user messages, just display the plain text
  if (role === "user") {
    return <div className="whitespace-pre-wrap">{content}</div>
  }

  // For assistant messages, parse code blocks and render markdown
  const parts = parseCodeBlocks(content)

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 -mt-2 -mr-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-6 w-6 rounded-full shadow-md"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Copy message"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="pt-2">
        {parts.map((part, index) =>
          typeof part === "string" ? (
            <div key={index} className="prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown>{part}</ReactMarkdown>
            </div>
          ) : (
            <CodeBlock key={index} language={part.language} code={part.code} />
          ),
        )}
      </div>
    </div>
  )
}

