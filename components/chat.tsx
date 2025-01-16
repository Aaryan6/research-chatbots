"use client";

import { UserFormData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateId } from "ai";
import { useChat } from "ai/react";
import { MessageCircle } from "lucide-react";
import { useRef, useState } from "react";
import ChatHeader from "./chat-header";
import Messages from "./messages";
import PromptBox from "./prompt";
import UserForm from "./user-form";
import { Chatbot } from "@/lib/types";

export default function Chat({
  userInfo,
  chatbot,
}: {
  userInfo: UserFormData | null;
  chatbot: Chatbot;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const chatId = useRef(generateId());

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: generateId(),
        role: "assistant",
        content: chatbot.InitialMessage || "Hi, how can I help you today?",
      },
    ],
    body: {
      user_email: userInfo?.email,
      id: chatId.current,
      systemPrompt: chatbot.systemPrompt,
      tools: chatbot.tools,
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  if (!userInfo) {
    return (
      <div className="fixed w-full max-w-md right-0 top-0 md:top-auto md:bottom-4 md:right-4 z-50 md:h-auto h-full">
        <UserForm />
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 md:top-auto md:bottom-4 md:right-4 z-50 md:h-auto h-full">
      {!isOpen ? (
        <Button
          className="h-14 w-14 absolute bottom-4 right-4 rounded-full bg-gray-900 hover:bg-gray-800 shadow-lg transition-transform hover:scale-105"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-full h-full md:w-[400px] md:h-[600px] rounded-none overflow-hidden md:rounded-3xl border-0 shadow-2xl transition-all">
          <ChatHeader isOpen={isOpen} setIsOpen={setIsOpen} chatbot={chatbot} />
          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <Messages messages={messages} />
            <PromptBox
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
