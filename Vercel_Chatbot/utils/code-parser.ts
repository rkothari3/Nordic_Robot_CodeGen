type CodeBlock = {
  language: string
  code: string
}

export function parseCodeBlocks(text: string): (string | CodeBlock)[] {
  // Regular expression to match code blocks with language specification
  // Matches patterns like ```python ... ``` or ```javascript ... ```
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)```/g

  const parts: (string | CodeBlock)[] = []
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the code block
    parts.push({
      language: match[1] || "text",
      code: match[2].trim(),
    })

    lastIndex = match.index + match[0].length
  }

  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts
}

