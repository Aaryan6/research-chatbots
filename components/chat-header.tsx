"use client";

import { Button } from "./ui/button";
import { CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { MoreVertical, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Chatbot } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { chatbotData } from "@/lib/data";

const GROUP_KEYS = ['group1', 'group2', 'group3', 'group4', 'group5', 'group6', 'group7', 'group8'] as const;
type GroupKey = typeof GROUP_KEYS[number];

interface ChatHeaderProps {
  chatbot: Chatbot;
  onClose: () => void;
  setChatbot: (chatbot: Chatbot) => void;
  hideGroupSelect?: boolean;
}

export default function ChatHeader({
  chatbot,
  onClose,
  setChatbot,
  hideGroupSelect = false,
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
        {!hideGroupSelect && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44">
              <div className="grid gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="w-full border"
                    onClick={() => {
                      const groupKey = GROUP_KEYS[index] as GroupKey;
                      setChatbot(chatbotData[groupKey]);
                    }}
                  >
                    Group {index + 1}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </CardHeader>
  );
}
