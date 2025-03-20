import { NextResponse } from "next/server"

// Allow responses up to 30 seconds
export const maxDuration = 30

// This is a JavaScript implementation of the Python code provided
// It uses the Google Generative AI API (Gemini)
export async function POST(req: Request) {
  try {
    const { message, chatId, knowledgeBase } = await req.json()

    // Check if GEMINI_API_KEY is set
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found. Please set GEMINI_API_KEY in your environment variables." },
        { status: 500 },
      )
    }

    // Prepare the prompt with knowledge base if provided
    let prompt = message
    if (knowledgeBase && knowledgeBase.trim()) {
      prompt = `I'm going to provide you with some context information that you should use to inform your responses when relevant:

${knowledgeBase}

Now, please respond to this query based on the context above when applicable:

${message}`
    }

    // Add instructions to format response with markdown
    const systemPrompt = `
You are Nordic-Robot AI, a helpful AI assistant. 
Format your responses using markdown:
- Use **bold** for emphasis
- Use *italic* for subtle emphasis
- Use ## for headings
- Use - or * for bullet points
- Use 1. 2. 3. for numbered lists
- Use > for blockquotes
- Use \`inline code\` for short code snippets
- Use \`\`\`language
code
\`\`\` for code blocks (with language specified)

When providing code examples, always specify the language after the opening triple backticks.
`

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }, { text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      return NextResponse.json({ error: "Error from Gemini API", details: errorData }, { status: response.status })
    }

    const data = await response.json()

    // Extract the text from the response
    let responseText = ""
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      responseText = data.candidates[0].content.parts.map((part: any) => part.text || "").join("")
    }

    return NextResponse.json({ response: responseText || "No response generated." })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

