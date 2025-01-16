"use client";

import { cn } from "@/lib/utils";
import { Message } from "ai";
import { useRef } from "react";
import { useEffect } from "react";
import RepairShopCards from "./repair-shops-cards";

export default function Messages({ messages }: { messages: Message[] }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
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
                      const { toolName, toolCallId, state } = toolInvocation;
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
  );
}
