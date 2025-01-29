"use client";

import { Button } from "./ui/button";
import { CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { MoreVertical, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Chatbot } from "@/lib/types";

interface ChatHeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chatbot: Chatbot;
  onClose: () => void;
  hasMessages: boolean;
  onEndChat: () => void;
}

export default function ChatHeader({ 
  isOpen, 
  setIsOpen, 
  chatbot, 
  onClose,
  hasMessages,
  onEndChat 
}: ChatHeaderProps) {
  return (
    <CardHeader className="border-b px-4 py-4 bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="h-8 w-8 text-white hover:text-white hover:bg-white/10 cursor-pointer z-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="size-12 relative overflow-hidden rounded-full">
            <Image
              src={chatbot.image || ""}
              alt={chatbot.name || ""}
              fill
              className="scale-125 mt-1"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{chatbot.name}</h3>
            <Badge
              variant="outline"
              className="mt-1 text-xs font-normal text-blue-200 border-blue-200/30"
            >
              AI-Powered Support
            </Badge>
          </div>
        </div>
        {hasMessages ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEndChat();
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors z-50"
          >
            End Chat
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
