"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, User, MessageSquare, Plus, Trash2, Code, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { v4 as uuidv4 } from "uuid"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { KnowledgeBase } from "../components/knowledge-base"
import { MessageContent } from "../components/message-content"
import { ThemeToggle } from "@/components/theme-toggle"

// Define chat types
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function ChatbotInterface() {
  // State for chats
  const [chats, setChats] = useState<Chat[]>(() => {
    // Initialize with one empty chat
    return [
      {
        id: uuidv4(),
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
      },
    ]
  })

  const [activeChat, setActiveChat] = useState<string>(chats[0].id)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [knowledgeBase, setKnowledgeBase] = useState("")
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false)

  // Get current active chat
  const currentChat = chats.find((chat) => chat.id === activeChat) || chats[0]

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    setMounted(true)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentChat.messages])

  // Update chat title based on first message
  useEffect(() => {
    if (currentChat.messages.length > 0 && currentChat.title === "New Chat") {
      const userMessage = currentChat.messages.find((m) => m.role === "user")
      if (userMessage) {
        const newTitle = userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? "..." : "")
        updateChatTitle(currentChat.id, newTitle)
      }
    }
  }, [currentChat.messages])

  // Create a new chat
  const createNewChat = () => {
    const newChat = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setActiveChat(newChat.id)
    setInput("")
  }

  // Delete a chat
  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    if (activeChat === chatId && chats.length > 1) {
      // Set active chat to the first remaining chat
      const remainingChats = chats.filter((chat) => chat.id !== chatId)
      setActiveChat(remainingChats[0]?.id || "")
    } else if (chats.length === 1) {
      // If deleting the last chat, create a new one
      createNewChat()
    }
  }

  // Update chat title
  const updateChatTitle = (chatId: string, newTitle: string) => {
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat)))
  }

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() === "" || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
    }

    // Update chat with user message
    setChats((prev) =>
      prev.map((chat) => (chat.id === activeChat ? { ...chat, messages: [...chat.messages, userMessage] } : chat)),
    )

    setInput("")
    setIsLoading(true)

    try {
      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          chatId: activeChat,
          knowledgeBase: knowledgeBase,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.response,
      }

      // Update chat with assistant message
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat ? { ...chat, messages: [...chat.messages, assistantMessage] } : chat,
        ),
      )
    } catch (error) {
      console.error("Error:", error)

      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
      }

      // Update chat with error message
      setChats((prev) =>
        prev.map((chat) => (chat.id === activeChat ? { ...chat, messages: [...chat.messages, errorMessage] } : chat)),
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) return null

  return (
    <div className="flex min-h-screen bg-background p-4">
      {/* Knowledge Base Modal */}
      <KnowledgeBase
        knowledgeBase={knowledgeBase}
        setKnowledgeBase={setKnowledgeBase}
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
      />

      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card rounded-l-lg shadow-lg border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Nordic-Robot AI</h1>
          </div>
          <p className="text-xs text-muted-foreground">Gemini-powered AI assistant</p>
        </div>

        <div className="flex-grow flex flex-col">
          <div className="p-4 space-y-2">
            <Button className="w-full flex items-center gap-2 justify-start" onClick={createNewChat}>
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start"
              onClick={() => setIsKnowledgeBaseOpen(true)}
            >
              <Database className="h-4 w-4" />
              <span>Knowledge Base</span>
            </Button>
          </div>

          <div className="px-2 flex-grow overflow-hidden">
            <h2 className="text-sm font-medium mb-2 text-muted-foreground px-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat History</span>
            </h2>

            <ScrollArea className="h-[calc(100vh-240px)]">
              <div className="space-y-1 pr-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center justify-between p-2 text-sm rounded-md cursor-pointer group ${
                      chat.id === activeChat ? "bg-primary/10 text-primary" : "hover:bg-accent"
                    }`}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{chat.title}</span>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteChat(chat.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete chat</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Nordic-Robot AI</h1>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={() => setIsKnowledgeBaseOpen(true)}>
            <Database className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={createNewChat}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main chat area */}
      <Card className="flex-1 flex flex-col shadow-lg md:rounded-l-none rounded-lg md:mt-0 mt-14 mb-0 border-border">
        <CardHeader className="border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>Nordic-Robot AI</span>
              </CardTitle>
              <CardDescription>
                {knowledgeBase ? (
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3 text-green-500" />
                    Using custom knowledge base
                  </span>
                ) : (
                  "Gemini-powered AI assistant"
                )}
              </CardDescription>
            </div>
            <ThemeToggle />
          </div>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Code className="h-12 w-12 text-primary" />
            </div>
            <p className="text-lg font-medium">Welcome to Nordic-Robot AI</p>
            <p className="text-sm max-w-md">Ask me to generate code, explain concepts, or help with your projects.</p>
            {!knowledgeBase && (
              <Button
                variant="outline"
                className="mt-4 flex items-center gap-2"
                onClick={() => setIsKnowledgeBaseOpen(true)}
              >
                <Database className="h-4 w-4" />
                <span>Add Knowledge Base</span>
              </Button>
            )}
          </div>
          {currentChat.messages.length === 0 ? (
            <></>
          ) : (
            currentChat.messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <MessageContent content={message.content} role={message.role} />
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="border-t border-border p-4 bg-card">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nordic-Robot AI a question..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || input.trim() === ""}>
              {isMobile ? <Bot className="h-4 w-4" /> : "Generate"}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

