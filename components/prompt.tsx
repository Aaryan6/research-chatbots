"use client";

import { Paperclip, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function PromptBox({
  input,
  handleInputChange,
  handleSubmit,
}: {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
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
          <Paperclip className="h-5 w-5" />
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
  );
}
