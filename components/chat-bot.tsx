"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { generateId } from "ai";
import { useChat } from "ai/react";
import {
  ArrowLeft,
  Copy,
  MessageCircle,
  MoreVertical,
  PaperclipIcon as PaperClip,
  Send,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import UserForm from "./user-form";
import { UserFormData } from "@/app/actions";
import Image from "next/image";
import RepairShopCards from "./repair-shops-cards";

export function ChatBot({ userInfo }: { userInfo: UserFormData | null }) {
  // If no user info, show the form
  const [isOpen, setIsOpen] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatId = useRef(generateId());

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: generateId(),
        role: "assistant",
        content:
          "Hi, I’m Maya! Let me know how I can help you today and ensure you have a seamless, worry-free experience!",
      },
    ],
    body: {
      user_email: userInfo?.email,
      id: chatId.current,
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  if (!userInfo) {
    return <UserForm />;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          className="h-14 w-14 rounded-full bg-gray-900 hover:bg-gray-800 shadow-lg transition-transform hover:scale-105"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-[400px] h-[600px] overflow-hidden rounded-3xl border-0 shadow-2xl transition-all">
          <CardHeader className="border-b px-4 py-4 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                }}
                className="h-8 w-8 text-white hover:text-white hover:bg-white/10 cursor-pointer z-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 flex-1">
                <div className="size-12 relative overflow-hidden rounded-full">
                  <Image
                    src="/maya.jpeg"
                    alt="Maya"
                    fill
                    className="scale-125 mt-1"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">Maya</h3>
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs font-normal text-blue-200 border-blue-200/30"
                  >
                    AI-Powered Support
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-blue-50"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col gap-2 relative w-full",
                    message.role === "user" ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex gap-3 items-end">
                    <div>
                      {message.content && (
                        <p
                          className={cn(
                            "rounded-2xl px-4 py-2.5 whitespace-pre-wrap shadow-sm border transition-all",
                            message.role === "user"
                              ? "bg-gray-900 text-white rounded-br-sm ml-auto"
                              : "bg-white text-gray-900 rounded-bl-sm"
                          )}
                        >
                          {message.content}
                        </p>
                      )}
                      {message.toolInvocations &&
                        message.toolInvocations.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {message.toolInvocations.map((toolInvocation) => {
                              const { toolName, toolCallId, state } =
                                toolInvocation;
                              if (toolName === "suggestRepairShops") {
                                if (state === "result") {
                                  const { result } = toolInvocation;
                                  return (
                                    <RepairShopCards
                                      key={toolCallId}
                                      repairShops={JSON.parse(result)}
                                    />
                                  );
                                }
                              }
                            })}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4 bg-white z-20  ">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about insurance coverage..."
                  className="flex-1 rounded-full border-gray-200 bg-gray-50 focus-visible:ring-gray-900 shadow-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100"
                >
                  <PaperClip className="h-5 w-5" />
                </Button>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
