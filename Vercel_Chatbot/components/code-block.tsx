"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Normalize language name
  const normalizedLanguage = language.toLowerCase()

  // Only show specific language labels
  const displayLanguage = ["python", "c++", "c", "java"].includes(normalizedLanguage) ? normalizedLanguage : "code"

  // Language-specific styling
  const getLanguageColor = () => {
    switch (normalizedLanguage) {
      case "python":
        return "dark:bg-blue-900 dark:text-blue-300 bg-blue-100 text-blue-800"
      case "c++":
        return "dark:bg-purple-900 dark:text-purple-300 bg-purple-100 text-purple-800"
      case "c":
        return "dark:bg-indigo-900 dark:text-indigo-300 bg-indigo-100 text-indigo-800"
      case "java":
        return "dark:bg-amber-900 dark:text-amber-300 bg-amber-100 text-amber-800"
      default:
        return "dark:bg-zinc-900 dark:text-zinc-400 bg-zinc-100 text-zinc-700"
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="relative my-4 rounded-md overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-2 ${getLanguageColor()} text-xs`}>
        <span className="capitalize">{displayLanguage}</span>
        <button
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-black/20 transition-colors"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre
        className={cn(
          "p-4 overflow-x-auto dark:bg-zinc-950 bg-zinc-50 dark:text-zinc-100 text-zinc-800 text-sm",
          normalizedLanguage === "python" && "dark:text-[#A6ACCD] text-[#5A67D8]",
          normalizedLanguage === "c++" && "dark:text-[#C3E88D] text-[#38A169]",
          normalizedLanguage === "c" && "dark:text-[#89DDFF] text-[#3182CE]",
          normalizedLanguage === "java" && "dark:text-[#F78C6C] text-[#DD6B20]",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

