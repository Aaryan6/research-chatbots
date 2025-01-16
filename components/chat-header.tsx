"use client";

import { Button } from "./ui/button";
import { CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Chatbot } from "@/lib/types";

export default function ChatHeader({
  isOpen,
  setIsOpen,
  chatbot,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  chatbot: Chatbot;
}) {
  return (
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}
