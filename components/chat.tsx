"use client";

import { endChat, UserFormData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { chatbotData } from "@/lib/data";
import { Chatbot } from "@/lib/types";
import { generateId } from "ai";
import { useChat } from "ai/react";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import ChatHeader from "./chat-header";
import Messages from "./messages";
import PromptBox from "./prompt";
import UserForm from "./user-form";

export default function Chat({ 
  userInfo, 
  hideGroupSelect = false,
  predefinedGroup
}: { 
  userInfo: UserFormData | null;
  hideGroupSelect?: boolean;
  predefinedGroup?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const chatId = useRef(generateId());
  const router = useRouter();

  // Initialize chatbot based on predefinedGroup or userInfo group
  const initialGroup = predefinedGroup || userInfo?.group || 1;
  const [chatbot, setChatbot] = useState<Chatbot>(() => {
    const groupKey = `group${initialGroup}` as keyof typeof chatbotData;
    return chatbotData[groupKey];
  });

  // Update chatbot when group changes
  useEffect(() => {
    const groupNumber = predefinedGroup || userInfo?.group || 1;
    const groupKey = `group${groupNumber}` as keyof typeof chatbotData;
    setChatbot(chatbotData[groupKey]);
  }, [predefinedGroup, userInfo?.group]);

  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: "/api/chat",
      sendExtraMessageFields: true,
      initialMessages: [
        {
          id: generateId(),
          role: "assistant",
          content: chatbot.initialMessage || "Hi, how can I help you today?",
        },
      ],
      body: {
        user_email: userInfo?.email,
        id: chatId.current,
        systemPrompt: chatbot.systemPrompt,
        group_id: predefinedGroup || userInfo?.group || 1,
      },
      onError(error) {
        console.error("Error:", error);
      },
    });

  const handleEndChat = async () => {
    try {
      if (chatId.current) {
        await endChat(chatId.current);
      }
    } catch (error) {
      console.error("Error ending chat:", error);
    }
  };

  const handleSetChatbot = (newChatbot: Chatbot) => {
    if (predefinedGroup) {
      // If predefinedGroup exists, don't allow changing the chatbot
      return;
    }
    router.refresh();
    chatId.current = generateId();
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: newChatbot.initialMessage || "Hello, how can I assist you today?",
      },
    ]);
    setChatbot(newChatbot);
  };

  if (!userInfo) {
    return (
      <div className="fixed w-full max-w-md right-0 top-0 md:top-auto md:bottom-4 md:right-4 z-50 md:h-auto h-full">
        <UserForm hideGroupSelect={hideGroupSelect} predefinedGroup={predefinedGroup} />
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
          <ChatHeader
            chatbot={chatbot}
            onClose={handleEndChat}
            setChatbot={handleSetChatbot}
            hideGroupSelect={hideGroupSelect}
          />
          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <Messages
              messages={messages}
              chatId={chatId.current}
              showFeedback={showFeedback}
            />
            <PromptBox
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              onFeedbackClick={() => setShowFeedback(!showFeedback)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
