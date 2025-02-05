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
import { useRef, useState } from "react";
import ChatHeader from "./chat-header";
import Messages from "./messages";
import PromptBox from "./prompt";
import UserForm from "./user-form";

export default function Chat({ userInfo }: { userInfo: UserFormData | null }) {
  const [isOpen, setIsOpen] = useState(true);
  const chatId = useRef(generateId());
  const [chatbot, setChatbot] = useState<Chatbot>(chatbotData.group1);
  const router = useRouter();

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
        group_id: chatbot.id,
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

  const handleSetChatbot = (chatbot: Chatbot) => {
    router.refresh();
    chatId.current = generateId();
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: chatbot.initialMessage || "Hello, how can I assist you today?",
      },
    ]);
    setChatbot(chatbot);
  };

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
          <ChatHeader
            chatbot={chatbot}
            onClose={handleEndChat}
            setChatbot={handleSetChatbot}
          />
          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <Messages messages={messages} chatId={chatId.current} />
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
