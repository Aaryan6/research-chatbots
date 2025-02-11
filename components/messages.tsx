"use client";

import { Message } from "ai";
import { useRef, useEffect, useState } from "react";
import RepairShopCards from "./repair-shops-cards";
import { MessageReaction } from "./message-reaction";
import { RateCard } from "./rate-card";
import supabase from "@/lib/db";

interface MessagesProps {
  messages: Message[];
  chatId: string;
  showFeedback: boolean;
}

type Reaction = {
  msg_id: string;
  reaction: string;
};

export default function Messages({
  messages,
  chatId,
  showFeedback,
}: MessagesProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, showFeedback]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${
            message.role === "assistant" ? "items-start" : "items-end"
          } relative z-10`}
        >
          {message.content && (
            <>
              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm border transition-all ${
                  message.role === "assistant"
                    ? "bg-white text-gray-900 rounded-bl-sm border-gray-100"
                    : "bg-gray-900 text-white rounded-br-sm border-gray-800"
                }`}
              >
                {message.content}
              </div>
              {message.role === "assistant" && (
                <div className="relative z-20">
                  <MessageReaction
                    messageId={message.id}
                    chatId={chatId}
                    reactions={reactions}
                    onReactionUpdate={(newReactions) =>
                      setReactions(newReactions)
                    }
                  />
                </div>
              )}
            </>
          )}
          {message.toolInvocations && message.toolInvocations.length > 0 && (
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
                } else if (toolName === "askForfeedback") {
                  if (state === "result") {
                    return <RateCard key={toolCallId} chatId={chatId} />;
                  }
                }
              })}
            </div>
          )}
        </div>
      ))}
      {showFeedback && (
        <div className="w-full max-w-sm mx-auto">
          <RateCard chatId={chatId} />
        </div>
      )}
    </div>
  );
}
